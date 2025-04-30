import type { APIRoute } from 'astro';
import { getSession } from "auth-astro/server";
import { sql } from "../../lib/mysql-connect"; // Adjust path as needed
import crypto from 'crypto';
import { EventType } from '../../lib/matrix/rrtypes'; // Assuming rrtypes defines EventType
import type { eventWithTime, metaEvent as RrwebMetaEvent } from '../../lib/matrix/rrtypes'; // Import specific event types
import { IncrementalSource } from '../../lib/matrix/rrtypes'; // Import IncrementalSource

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const session = await getSession(request);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "Unauthorized", user: session }), { status: 401 });
  }
  
  let body: any;
  let events: eventWithTime[] = []; // Add type
  let htmlHash: string | null = null;

  try {
    body = await request.json();
    events = body.events; // Assign typed events
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

    // --- Ensure Webstate Exists (using user_id from session) ---
    // Check if webstate exists for this user
    // const [webstateRows]: [any[], any] = await sql.query('SELECT html_hash FROM webstate WHERE html_hash = ? AND user_id = ?', [htmlHash, userId]);
    // if (webstateRows.length === 0) {
    //     // If not, insert it (assuming user has permission - might need more checks)
    //     console.log(`Inserting new webstate ${htmlHash} for user ${userId}`);
    //     await sql.query('INSERT INTO webstate (html_hash, user_id) VALUES (?, ?)', [htmlHash, userId]);
    // } 
    // else: webstate already exists for this user, proceed.

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
    const eventInsertPromises = [];
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
        eventInsertPromises.push(sql.query(baseEventQuery, [eventId, replayId, eventTypeString, eventTimestamp, event.delay]));

        // Meta Event Specific Insertion
        if (event.type === EventType.Meta) {
            const metaData = event.data as RrwebMetaEvent['data'];
            const metaQuery = 'INSERT INTO meta_event (event_id, href, width, height) VALUES (?, ?, ?, ?)';
            eventInsertPromises.push(sql.query(metaQuery, [eventId, metaData.href, metaData.width, metaData.height]));
        }
        
        // TODO: Add logic for FullSnapshot events
        // TODO: Add logic for IncrementalSnapshot events (parsing data.source etc.)
    }

    // Wait for all event insertions
    await Promise.all(eventInsertPromises);

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