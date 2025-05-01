import type { APIRoute } from 'astro';
import { getSession } from "auth-astro/server";
import { sql } from "../../lib/mysql-connect"; // Adjust path as needed
import crypto from 'crypto';
import { EventType } from '../../lib/matrix/rrtypes'; // Assuming rrtypes defines EventType
import type { 
    eventWithTime, 
    metaEvent as RrwebMetaEvent, 
    incrementalSnapshotEvent, 
    mouseInteractionData, 
    mousemoveData, 
    mousePosition as RrwebMousePosition,
    mutationData,       
    textMutation,
    attributeMutation,
    addedNodeMutation,
    removedNodeMutation,
    scrollData,
    selectionData, 
    SelectionRange as RrwebSelectionRange,
    inputData,
    mediaInteractionData,
    fontData,
    viewportResizeData // Added
} from '../../lib/matrix/rrtypes'; // Import specific event types
import { IncrementalSource, MediaInteractions } from '../../lib/matrix/rrtypes'; // Added MediaInteractions
import { 
    NodeType, 
    type fullSnapshotEvent as RrwebFullSnapshotEvent, 
    type serializedNodeWithId, 
    type elementNode, 
    type textNode, 
    type commentNode, 
    type documentNode,
    type documentTypeNode,
    type cdataNode
} from '../../lib/matrix/rrtypes';
import { MouseInteractions } from '../../lib/matrix/rrtypes'; // Import Enum needed at runtime

// Define the type for our recursive helper function
type SaveNodeParams = {
    node: serializedNodeWithId;
    replayId: string; // Pass replayId for potential context/logging
    // Note: Using the global 'sql' connection assumes single transaction context
};

/**
 * Recursively saves a serialized DOM node and its children/attributes to the database.
 * Assumes a transaction has already been started on the 'sql' connection.
 */
async function saveSerializedNode({ node, replayId }: SaveNodeParams): Promise<void> {
    
    const nodeType = node.type; // Get type before switch
    const nodeId = node.id; // Get id before switch

    // 1. Map NodeType enum to DB string
    let nodeTypeString: string;
    switch (nodeType) { // Use the stored type
        case NodeType.Document:       nodeTypeString = 'Document'; break;
        case NodeType.DocumentType:   nodeTypeString = 'DocumentType'; break;
        case NodeType.Element:        nodeTypeString = 'Element'; break;
        case NodeType.Text:           nodeTypeString = 'Text'; break;
        case NodeType.CDATA:          nodeTypeString = 'CDATA'; break;
        case NodeType.Comment:        nodeTypeString = 'Comment'; break;
        default: 
            console.warn(`[saveSerializedNode] Unsupported node type ${nodeType} for node ID ${nodeId}. Skipping.`);
            return; // Skip unsupported types
    }

    // 2. Prepare base node data
    const baseNodeQuery = `
        INSERT INTO serialized_node (
            id, type, root_id, is_shadow_host, is_shadow, 
            compat_mode, name, public_id, system_id, 
            tag, is_svg, need_block, is_custom, 
            text_content
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE type=VALUES(type); -- Handle potential re-insertion if needed, though rrweb IDs should be unique per snapshot
    `;
    const baseNodeParams = [
        node.id,
        nodeTypeString,
        node.rootId ?? null, // Use rootId if present
        node.isShadowHost ?? false,
        node.isShadow ?? false,
        // Document/DocumentType specific
        (node as documentNode).compatMode ?? null,
        (node as documentTypeNode).name ?? null, 
        (node as documentTypeNode).publicId ?? null,
        (node as documentTypeNode).systemId ?? null,
        // Element specific
        (node as elementNode).tagName ?? null,
        (node as elementNode).isSVG ?? false,
        (node as elementNode).needBlock ?? false,
        (node as elementNode).isCustom ?? false,
        // Text/Comment/CDATA specific
        (node as textNode | commentNode | cdataNode).textContent ?? null
    ];

    await sql.query(baseNodeQuery, baseNodeParams);

    // 3. Handle Attributes (if Element)
    if (node.type === NodeType.Element) {
        const elementData = node as elementNode; // Type assertion
        const attributes = elementData.attributes || {};
        const attributeInsertPromises = [];

        for (const [key, value] of Object.entries(attributes)) {
            // Skip internal rrweb attributes like _cssText if necessary
            if (key === '_cssText') continue; 

            const attrQuery = `
                INSERT INTO serialized_node_attribute (
                    node_id, attribute_key, string_value, number_value, is_true, is_null
                ) VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE string_value=VALUES(string_value), number_value=VALUES(number_value), is_true=VALUES(is_true), is_null=VALUES(is_null);
            `;
            let stringValue: string | null = null;
            let numberValue: number | null = null;
            let isTrue = false;
            let isNull = false;

            if (value === null) {
                isNull = true;
            } else if (typeof value === 'boolean') {
                isTrue = value;
            } else if (typeof value === 'number') {
                numberValue = value;
            } else {
                stringValue = String(value); // Default to string
            }
            
            attributeInsertPromises.push(sql.query(attrQuery, [
                node.id,
                key,
                stringValue,
                numberValue,
                isTrue,
                isNull
            ]));
        }
        await Promise.all(attributeInsertPromises); // Insert all attributes for this node
    }

    // 4. Handle Children (Recursive Call & Linking)
    const childNodes = (node as documentNode | elementNode).childNodes;
    if (childNodes && Array.isArray(childNodes)) {
        const childLinkPromises = [];
        for (const childNode of childNodes) {
            // Recursively save the child node first
            await saveSerializedNode({ node: childNode, replayId }); 
            
            // Then link parent to child
            const linkQuery = 'INSERT INTO serialized_node_child (parent_id, child_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE child_id=VALUES(child_id);';
            childLinkPromises.push(sql.query(linkQuery, [node.id, childNode.id]));
        }
        await Promise.all(childLinkPromises); // Link all children for this node
    }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const session = await getSession(request);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "Unauthorized", user: session }), { status: 401 });
  }
  
  let body: any;
  let events: eventWithTime[] = []; // Add type
  let consoleLogs: any[] = []; // <-- Add consoleLogs array
  let htmlHash: string | null = null;

  try {
    body = await request.json();
    events = body.events; // Assign typed events
    consoleLogs = body.consoleLogs || []; // <-- Assign consoleLogs, default to empty array
    const { clientInfo: clientInfoFromReq } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(JSON.stringify({ message: "Missing or invalid recording events" }), { status: 400 });
    }

    // --- Start Transaction ---
    await sql.beginTransaction();

    // --- Extract Metadata (as before) ---
    const replayId = crypto.randomUUID();
    const userId = session.user.id; // Needed for webstate check/insert
    const startTime = new Date(events[0].timestamp).toISOString().slice(0, 19).replace('T', ' ');
    const endTime = new Date(events[events.length - 1].timestamp).toISOString().slice(0, 19).replace('T', ' ');

    // Find the first Meta event to extract the webstate hash from href
    const metaEvent = events.find((e) => e.type === EventType.Meta) as RrwebMetaEvent | undefined;
    if (metaEvent?.data?.href) {
      try {
        const url = new URL(metaEvent.data.href);
        const pathParts = url.pathname.split('/');
        const filename = pathParts.pop();
        if (filename && filename.endsWith('.html')) {
          htmlHash = filename.slice(0, -5);
          if (!/^[a-f0-9]{64}$/.test(htmlHash)) { 
             console.warn(`Extracted hash ${htmlHash} does not match expected format.`);
             htmlHash = null;
          }
        }
      } catch (urlError) {
        console.error(`Error parsing href URL: ${metaEvent.data.href}`, urlError);
      }
    }

    if (!htmlHash) {
        await sql.rollback(); // Rollback transaction
        return new Response(JSON.stringify({ message: "Could not determine webstate hash from recording data" }), { status: 400 });
    }

    // --- Client Info Extraction (as before) ---
    const browserName = clientInfoFromReq?.browser?.name || null;
    const browserVersion = clientInfoFromReq?.browser?.version || null;
    const osName = clientInfoFromReq?.os?.name || null;
    const osVersion = clientInfoFromReq?.os?.version || null;
    const ipAddress = clientInfoFromReq?.ip || null;
    const deviceTypeRaw = clientInfoFromReq?.device?.type || null;

    let product: string | null = null;
    if (browserName?.includes('Chrome') || browserName?.includes('Chromium')) product = 'Chrome';
    else if (browserName?.includes('Firefox')) product = 'Mozilla';
    else if (browserName?.includes('Safari') && !browserName?.includes('Chrome')) product = 'Safari';
    else if (browserName?.includes('Edg')) product = 'Edge';
    else if (browserName?.includes('Edge')) product = 'Edge';

    let osType: string | null = null;
    if (osName?.includes('Windows')) osType = 'Windows NT';
    else if (osName?.includes('Mac OS')) osType = 'Macintosh';
    else if (osName?.includes('Linux')) osType = 'Linux';
    else if (osName?.includes('iOS')) osType = 'iOS';
    else if (osName?.includes('Android')) osType = 'Android';

    let deviceType: string = 'Unknown';
    if (deviceTypeRaw === 'mobile' || osType === 'iOS' || osType === 'Android') deviceType = 'Mobile';
    else if (deviceTypeRaw === 'tablet') deviceType = 'Tablet';
    else if (osType === 'Windows NT' || osType === 'Macintosh' || osType === 'Linux') deviceType = 'Desktop';

    let viewportWidth: number | null = null;
    let viewportHeight: number | null = null;
    if (metaEvent?.type === EventType.Meta) { // Use the already found metaEvent
        viewportWidth = metaEvent.data.width;
        viewportHeight = metaEvent.data.height;
    } else {
        // Need to find the first ViewportResize event if Meta is missing.
        const firstResizeEvent = events.find((e: any) => 
            e.type === EventType.IncrementalSnapshot && e.data?.source === IncrementalSource.ViewportResize
        );
        if (firstResizeEvent) {
            // Assert the type of data for ViewportResize
            const resizeData = firstResizeEvent.data as { width: number; height: number }; 
            viewportWidth = resizeData.width;
            viewportHeight = resizeData.height;
        }
    }

    // --- Database Insertion (Phase 1: Replay Metadata) ---
    const replayQuery = `
      INSERT INTO replay (
        replay_id, html_hash, start_time, end_time, product, product_version, 
        device_type, os_type, os_version, network_id, 
        d_viewport_width, d_viewport_height
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const replayParams = [
      replayId, htmlHash, startTime, endTime, product, browserVersion,
      deviceType, osType, osVersion, ipAddress, viewportWidth, viewportHeight
    ];
    await sql.query(replayQuery, replayParams);

    // --- Database Insertion (Phase 2a: Events - Meta) ---
    for (const event of events) {
        const eventId = crypto.randomUUID();
        const eventTimestamp = new Date(event.timestamp).toISOString().slice(0, 19).replace('T', ' ');
        const eventTypeNumeric = event.type; // Use the numeric enum value
        let eventTypeString: string; // String representation for DB ENUM
        // Import IncrementalSource if not already imported at the top
        const { IncrementalSource } = await import('../../lib/matrix/rrtypes'); 

        switch (eventTypeNumeric) {
            // case EventType.DomContentLoaded: // Schema doesn't support these yet
            // case EventType.Load:
            case EventType.FullSnapshot:
                eventTypeString = 'FullSnapshot'; break;
            case EventType.IncrementalSnapshot:
                eventTypeString = 'IncrementalSnapshot'; break;
            case EventType.Meta:
                eventTypeString = 'Meta'; break;
            default:
                console.warn(`Unsupported event type ${eventTypeNumeric} encountered. Skipping.`);
                continue; // Skip unsupported types for now
        }

        // Base Event Insertion
        const baseEventQuery = 'INSERT INTO event (event_id, replay_id, type, timestamp, delay) VALUES (?, ?, ?, ?, ?)';
        // We will await this base insert before proceeding with specific types
        // This ensures the event record exists before detail records reference it.
        await sql.query(baseEventQuery, [eventId, replayId, eventTypeString, eventTimestamp, event.delay]);

        // Specific Event Type Handling
        if (event.type === EventType.Meta) {
            const metaData = event.data as RrwebMetaEvent['data'];
            const metaQuery = 'INSERT INTO meta_event (event_id, href, width, height) VALUES (?, ?, ?, ?)';
            await sql.query(metaQuery, [eventId, metaData.href, metaData.width, metaData.height]);
        }
        else if (event.type === EventType.FullSnapshot) {
            const snapshotData = event.data as RrwebFullSnapshotEvent['data'];
            const rootNode = snapshotData.node;
            const initialOffset = snapshotData.initialOffset;

            // Recursively save the node tree
            await saveSerializedNode({ node: rootNode, replayId });

            // Insert into full_snapshot_event table
            const snapshotQuery = 'INSERT INTO full_snapshot_event (event_id, node_id, initial_offset_top, initial_offset_left) VALUES (?, ?, ?, ?)';
            await sql.query(snapshotQuery, [eventId, rootNode.id, initialOffset.top, initialOffset.left]);
        } 
        else if (event.type === EventType.IncrementalSnapshot) {
            // Cast to the base incremental snapshot type to access data.source
            const incrementalEvent = event as unknown as { data: { source: IncrementalSource } };
            const source = incrementalEvent.data.source;

            // Map IncrementalSource enum to the DB string ENUM
            // (Assuming your ENUM values in DB match the IncrementalSource names)
            let sourceString: string;
            switch (source) {
                case IncrementalSource.Mutation:           sourceString = 'Mutation'; break;
                case IncrementalSource.MouseMove:          sourceString = 'MouseMove'; break;
                case IncrementalSource.MouseInteraction:   sourceString = 'MouseInteraction'; break;
                case IncrementalSource.Scroll:             sourceString = 'Scroll'; break;
                case IncrementalSource.ViewportResize:     sourceString = 'ViewportResize'; break;
                case IncrementalSource.Input:              sourceString = 'Input'; break;
                case IncrementalSource.TouchMove:          sourceString = 'TouchMove'; break;
                case IncrementalSource.MediaInteraction:   sourceString = 'MediaInteraction'; break;
                case IncrementalSource.StyleSheetRule:     sourceString = 'StyleSheetRule'; break;
                case IncrementalSource.CanvasMutation:     sourceString = 'CanvasMutation'; break;
                case IncrementalSource.Font:               sourceString = 'Font'; break;
                case IncrementalSource.Log:                sourceString = 'Log'; break;
                case IncrementalSource.Drag:               sourceString = 'Drag'; break;
                case IncrementalSource.StyleDeclaration:   sourceString = 'StyleDeclaration'; break;
                case IncrementalSource.Selection:          sourceString = 'Selection'; break;
                case IncrementalSource.AdoptedStyleSheet:  sourceString = 'AdoptedStyleSheet'; break;
                case IncrementalSource.CustomElement:      sourceString = 'CustomElement'; break;
                default:
                    console.warn(`Unsupported incremental source ${source} encountered. Skipping incremental details.`);
                    continue; // Skip if source is unknown
            }

            // Insert into incremental_snapshot_event
            const incrSnapshotQuery = 'INSERT INTO incremental_snapshot_event (event_id, t) VALUES (?, ?)';
            await sql.query(incrSnapshotQuery, [eventId, sourceString]);

            // Specific handlers based on sourceString
            if (sourceString === 'MouseInteraction') {
                // Assert the type for MouseInteraction data
                const interactionData = event.data as mouseInteractionData;
                const interactionTypeNumeric = interactionData.type;
                const nodeId = interactionData.id;
                const x = interactionData.x;
                const y = interactionData.y;
                const pointerType = interactionData.pointerType; // Assuming pointerType is already string 'Mouse'/'Pen'/'Touch' or number

                // Map numeric interaction type to DB ENUM string
                let interactionTypeString: string;
                switch (interactionTypeNumeric) {
                    case MouseInteractions.MouseUp:           interactionTypeString = 'MouseUp'; break;
                    case MouseInteractions.MouseDown:         interactionTypeString = 'MouseDown'; break;
                    case MouseInteractions.Click:             interactionTypeString = 'Click'; break;
                    case MouseInteractions.ContextMenu:       interactionTypeString = 'ContextMenu'; break;
                    case MouseInteractions.DblClick:          interactionTypeString = 'DblClick'; break;
                    case MouseInteractions.Focus:             interactionTypeString = 'Focus'; break;
                    case MouseInteractions.Blur:              interactionTypeString = 'Blur'; break;
                    case MouseInteractions.TouchStart:        interactionTypeString = 'TouchStart'; break;
                    case MouseInteractions.TouchMove_Departed:interactionTypeString = 'TouchMove_Departed'; break;
                    case MouseInteractions.TouchEnd:          interactionTypeString = 'TouchEnd'; break;
                    case MouseInteractions.TouchCancel:       interactionTypeString = 'TouchCancel'; break;
                    default:
                        console.warn(`Unsupported mouse interaction type ${interactionTypeNumeric} for event ${eventId}. Skipping interaction details.`);
                        continue; // Skip if interaction type is unknown
                }
                
                // Map pointerType if it's numeric (adjust based on actual rrweb type definition)
                let pointerTypeString: string | null = null;
                if (typeof pointerType === 'number') { // Example check - adjust if pointerType is different
                    // Add mapping logic if needed, e.g.:
                    // if (pointerType === 0) pointerTypeString = 'Mouse';
                    // else if (pointerType === 1) pointerTypeString = 'Pen';
                    // else if (pointerType === 2) pointerTypeString = 'Touch';
                     pointerTypeString = String(pointerType); // Placeholder: Convert number to string if ENUM expects '0', '1', '2'
                     // OR map directly if the ENUM uses 'Mouse', 'Pen', 'Touch'
                     switch(pointerType) {
                         case 0: pointerTypeString = 'Mouse'; break;
                         case 1: pointerTypeString = 'Pen'; break;  // Assuming 1 maps to Pen
                         case 2: pointerTypeString = 'Touch'; break;
                         default: pointerTypeString = null; // Handle unexpected values
                     }
                } else if (typeof pointerType === 'string') {
                    pointerTypeString = pointerType; // Assume it's already 'Mouse', 'Pen', or 'Touch'
                } // Handle null/undefined if necessary
                

                // Insert into mouse_interaction_data
                const interactionQuery = `
                    INSERT INTO mouse_interaction_data 
                        (event_id, interaction_type, node_id, x, y, pointer_type)
                    VALUES (?, ?, ?, ?, ?, ?)
                `;
                await sql.query(interactionQuery, [eventId, interactionTypeString, nodeId, x, y, pointerTypeString]);
            }
            // Handle MouseMove and TouchMove (they share the same data structure)
            else if (sourceString === 'MouseMove' || sourceString === 'TouchMove' || sourceString === 'Drag') {
                const moveData = event.data as mousemoveData;
                const positions = moveData.positions;

                // 1. Insert into mousemove_data table (linking to the event)
                const mouseMoveDataQuery = 'INSERT INTO mousemove_data (event_id) VALUES (?)';
                await sql.query(mouseMoveDataQuery, [eventId]);

                // 2. Insert each position into mouse_position table
                const positionInsertPromises = [];
                for (const pos of positions) {
                    // Type assertion for clarity, matching rrweb type
                    const position = pos as RrwebMousePosition; 
                    const positionQuery = `
                        INSERT INTO mouse_position 
                            (event_id, x, y, node_id, time_offset)
                        VALUES (?, ?, ?, ?, ?)
                    `;
                    positionInsertPromises.push(
                        sql.query(positionQuery, [
                            eventId,          // Foreign key to mousemove_data
                            position.x,
                            position.y,
                            position.id,      // node_id in the database schema
                            position.timeOffset
                        ])
                    );
                }
                // Wait for all position inserts for this event to complete
                await Promise.all(positionInsertPromises);
            }
            // Handle Scroll events
            else if (sourceString === 'Scroll') {
                const scroll = event.data as scrollData;
                const nodeId = scroll.id;
                const x = scroll.x;
                const y = scroll.y;

                const scrollQuery = 'INSERT INTO scroll_data (event_id, node_id, x, y) VALUES (?, ?, ?, ?)';
                await sql.query(scrollQuery, [eventId, nodeId, x, y]);
            }
            // Handle Selection events
            else if (sourceString === 'Selection') {
                const selection = event.data as selectionData;
                const ranges = selection.ranges;

                // 1. Insert into selection_data table
                const selectionDataQuery = 'INSERT INTO selection_data (event_id) VALUES (?)';
                await sql.query(selectionDataQuery, [eventId]);

                // 2. Insert each range into selection_range table
                const rangeInsertPromises = [];
                if (ranges?.length) {
                    for (const r of ranges) {
                        // Type assertion for clarity
                        const range = r as RrwebSelectionRange;
                        const rangeQuery = `
                            INSERT INTO selection_range 
                                (event_id, start, start_offset, end, end_offset)
                            VALUES (?, ?, ?, ?, ?)
                        `;
                        rangeInsertPromises.push(
                            sql.query(rangeQuery, [
                                eventId,         // Foreign key to selection_data
                                range.start,
                                range.startOffset,
                                range.end,
                                range.endOffset
                            ])
                        );
                    }
                    // Wait for all range inserts for this event to complete
                    await Promise.all(rangeInsertPromises);
                }
            }
            // Handle Input events
            else if (sourceString === 'Input') {
                const input = event.data as inputData;
                const nodeId = input.id;
                const text = input.text;
                const isChecked = input.isChecked;
                // rrweb v2 doesn't seem to have userTriggered, but schema does. Defaulting to false.
                const userTriggered = (input as any).userTriggered ?? false; 

                const inputQuery = 'INSERT INTO input_data (event_id, node_id, text, is_checked, user_triggered) VALUES (?, ?, ?, ?, ?)';
                await sql.query(inputQuery, [eventId, nodeId, text, isChecked, userTriggered]);
            }
            // Handle MediaInteraction events
            else if (sourceString === 'MediaInteraction') {
                const mediaData = event.data as mediaInteractionData;
                const interactionTypeNumeric = mediaData.type;
                const nodeId = mediaData.id;
                const currentTime = mediaData.currentTime; // Might be undefined
                const volume = mediaData.volume;           // Might be undefined
                const muted = mediaData.muted;             // Might be undefined
                const loop = mediaData.loop;               // Might be undefined
                const playbackRate = mediaData.playbackRate;   // Might be undefined

                // Map numeric interaction type to DB ENUM string
                let interactionTypeString: string;
                switch (interactionTypeNumeric) {
                    case MediaInteractions.Play:         interactionTypeString = 'Play'; break;
                    case MediaInteractions.Pause:        interactionTypeString = 'Pause'; break;
                    case MediaInteractions.Seeked:       interactionTypeString = 'Seeked'; break;
                    case MediaInteractions.VolumeChange: interactionTypeString = 'VolumeChange'; break;
                    case MediaInteractions.RateChange:   interactionTypeString = 'RateChange'; break;
                    default:
                        console.warn(`Unsupported media interaction type ${interactionTypeNumeric} for event ${eventId}. Skipping interaction details.`);
                        continue;
                }

                const mediaQuery = `
                    INSERT INTO media_interaction_data 
                        (event_id, interaction_type, node_id, time, volume, muted, isloop, playback_rate)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `;
                await sql.query(mediaQuery, [
                    eventId, 
                    interactionTypeString, 
                    nodeId, 
                    currentTime, // DB schema uses 'time', pass currentTime here
                    volume, 
                    muted, 
                    loop,        // DB schema uses 'isloop', pass loop here
                    playbackRate
                ]);
            }
            // Handle ViewportResize events
            else if (sourceString === 'ViewportResize') {
                const resizeData = event.data as viewportResizeData;
                const width = resizeData.width;
                const height = resizeData.height;

                const resizeQuery = 'INSERT INTO viewport_resize_data (event_id, width, height) VALUES (?, ?, ?)';
                await sql.query(resizeQuery, [eventId, width, height]);
            }
            // Handle Font events
            else if (sourceString === 'Font') {
                // ... existing Font handler code ...
            }
            // Handle Mutation events <--- *** NEW BLOCK START ***
            else if (sourceString === 'Mutation') {
                const mutation = event.data as mutationData;

                // 1. Insert base mutation record
                const mutationDataQuery = 'INSERT INTO mutation_data (event_id, is_attach_iframe) VALUES (?, ?)';
                await sql.query(mutationDataQuery, [eventId, mutation.isAttachIframe ?? false]);

                const mutationPromises = [];

                // 2. Handle text mutations (changes to existing text nodes)
                if (mutation.texts?.length) {
                    for (const textChange of mutation.texts) {
                        const textQuery = 'INSERT INTO text_mutation (event_id, node_id, value) VALUES (?, ?, ?)';
                        mutationPromises.push(sql.query(textQuery, [eventId, textChange.id, textChange.value]));
                    }
                }

                // 3. Handle attribute mutations (changes to existing nodes' attributes)
                if (mutation.attributes?.length) {
                    for (const attrChange of mutation.attributes) {
                        const nodeAttributes = attrChange.attributes;
                        const nodeId = attrChange.id;
                        
                        // Insert/Ensure the base attribute mutation record exists for this node in this event
                        const attrBaseQuery = 'INSERT INTO attribute_mutation (event_id, node_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE node_id=VALUES(node_id);';
                        mutationPromises.push(sql.query(attrBaseQuery, [eventId, nodeId]));
                        
                        // Insert each specific attribute change into attribute_mutation_entry
                        for (const [key, value] of Object.entries(nodeAttributes)) {
                            // TODO: Handle StyleOMValue properly if 'value' is an object.
                            // This would involve inserting into style_om_value tables and referencing the ID here.
                            if (typeof value === 'string' || value === null) {
                                const entryQuery = 'INSERT INTO attribute_mutation_entry (event_id, node_id, attribute_key, string_value) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE string_value=VALUES(string_value);';
                                mutationPromises.push(sql.query(entryQuery, [eventId, nodeId, key, value]));
                            } else {
                                console.warn(`[Save Replay] Skipping non-string/null attribute mutation for key ${key} on node ${nodeId} in event ${eventId}. Value:`, value);
                            }
                        }
                    }
                }

                // 4. Handle node removals
                if (mutation.removes?.length) {
                    for (const removal of mutation.removes) {
                        const removeQuery = 'INSERT INTO removed_node_mutation (event_id, parent_id, node_id, is_shadow) VALUES (?, ?, ?, ?)';
                        mutationPromises.push(sql.query(removeQuery, [eventId, removal.parentId, removal.id, removal.isShadow ?? false]));
                    }
                }

                // 5. Handle node additions
                if (mutation.adds?.length) {
                    for (const addition of mutation.adds) {
                        const nodeToAdd = addition.node;
                        // IMPORTANT: Save the node structure *before* recording the addition link
                        await saveSerializedNode({ node: nodeToAdd, replayId });
                        
                        // Now record the addition linkage
                        const addQuery = 'INSERT INTO added_node_mutation (event_id, parent_id, next_id, node_id) VALUES (?, ?, ?, ?)';
                        // Add the promise for the linkage insert to the list
                        mutationPromises.push(sql.query(addQuery, [
                            eventId, 
                            addition.parentId, 
                            addition.nextId ?? null,     
                            nodeToAdd.id
                        ]));
                    }
                }

                // Wait for all collected mutation sub-operation promises to complete
                await Promise.all(mutationPromises);
            }
             // *** NEW BLOCK END ***
        }
    }

    // --- Database Insertion (Phase 2b: Console Logs) ---
    if (consoleLogs.length > 0) {
      // Calculate start timestamp for delay calculation
      const startTimestamp = events[0]?.timestamp; // Use first rrweb event timestamp as base

      if (startTimestamp) {
        const consoleLogInsertPromises = [];
        for (const log of consoleLogs) {
            const logId = crypto.randomUUID();
            const logTimestamp = new Date(log.timestamp).toISOString().slice(0, 19).replace('T', ' ');
            const delay = log.timestamp - startTimestamp;
            const level = log.level; 
            const payload = JSON.stringify(log.args || []); // Stringify the args array for JSON column
            // const trace = log.trace || null; // Assuming trace might be sent later

            // Basic validation for level
            const validLevels = ['log', 'warn', 'error', 'info', 'debug'];
            if (!validLevels.includes(level)) {
                console.warn(`[Save Replay] Skipping console log with invalid level: ${level}`);
                continue;
            }

            const logQuery = `
              INSERT INTO console_log 
                (log_id, replay_id, level, payload, delay, timestamp, trace)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            consoleLogInsertPromises.push(
                sql.query(logQuery, [
                    logId, 
                    replayId, 
                    level, 
                    payload, 
                    delay > 0 ? delay : 0, // Ensure delay isn't negative
                    logTimestamp,
                    null // Placeholder for trace for now
                ])
            );
        }
        await Promise.all(consoleLogInsertPromises);
      } else {
          console.warn("[Save Replay] Cannot calculate console log delays: No rrweb events found.");
      }
    }

    // --- Commit Transaction ---
    await sql.commit();

    // --- Response ---
    return new Response(JSON.stringify({ message: "Recording saved successfully", replayId: replayId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    // --- Rollback Transaction on Error ---
    console.error("Error during replay save transaction, rolling back:", error);
    await sql.rollback(); 
    
    // Send error response (keep existing structure)
    return new Response(JSON.stringify({ message: `Error saving replay: ${error.message}`, body: body, error: error }), { // Removed body/params from response for brevity
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 