import type { APIRoute } from 'astro';
import { getSession } from "auth-astro/server";
import { sql } from "../../lib/mysql-connect"; // Adjust path as needed
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';
import { EventType } from '../../lib/matrix/rrtypes'; // Assuming rrtypes defines EventType

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const session = await getSession(request);

  if (!session?.user?.id) {
    return new Response(JSON.stringify({ message: "Unauthorized", user: session }), { status: 401 });
  }
  let body: any;
  let startTime: string | null = null;
  let endTime: string | null = null;
  let htmlHash: string | null = null;
  let params: any = null;

  try {
    body = await request.json();
    const { events, clientInfo: clientInfoFromReq } = body;

    if (!events || !Array.isArray(events) || events.length === 0) {
      return new Response(JSON.stringify({ message: "Missing or invalid recording events" }), { status: 400 });
    }

    // --- Extract Metadata ---
    const replayId = crypto.randomUUID();

    // Timestamps (ensure events are sorted if not already)
    startTime = new Date(events[0].timestamp).toISOString().slice(0, 19).replace('T', ' ');
    endTime = new Date(events[events.length - 1].timestamp).toISOString().slice(0, 19).replace('T', ' ');

    // Find the first Meta event to extract the webstate hash from href
    const metaEvent = events.find((e: any) => e.type === EventType.Meta);
    if (metaEvent?.data?.href) {
      try {
        const url = new URL(metaEvent.data.href);
        const pathParts = url.pathname.split('/');
        const filename = pathParts.pop(); // e.g., f62b...3013.html
        if (filename && filename.endsWith('.html')) {
          htmlHash = filename.slice(0, -5); // Remove .html extension
          if (!/^[a-f0-9]{64}$/.test(htmlHash)) { // Validate hash format
             console.warn(`Extracted hash ${htmlHash} does not match expected format.`);
             htmlHash = null; // Invalidate if format is wrong
          }
        } else {
            console.warn(`Could not extract filename or unexpected format: ${filename}`);
        }
      } catch (urlError) {
        console.error(`Error parsing href URL: ${metaEvent.data.href}`, urlError);
      }
    }

    if (!htmlHash) {
        // Fallback or error if hash couldn't be determined from Meta event
        // Might need to look at FullSnapshot data if Meta is missing, but that's more complex
        return new Response(JSON.stringify({ message: "Could not determine webstate hash from recording data" }), { status: 400 });
    }

    // Client Info (use info passed from client-side define:vars)
    const browserName = clientInfoFromReq?.browser?.name || null;
    const browserVersion = clientInfoFromReq?.browser?.version || null;
    const osName = clientInfoFromReq?.os?.name || null;
    const osVersion = clientInfoFromReq?.os?.version || null;
    const ipAddress = clientInfoFromReq?.ip || null;
    const deviceVendor = clientInfoFromReq?.device?.vendor || null;
    const deviceModel = clientInfoFromReq?.device?.model || null;
    const deviceTypeRaw = clientInfoFromReq?.device?.type || null;

    // Map browser name to schema enum
    let product: string | null = null;
    if (browserName?.includes('Chrome') || browserName?.includes('Chromium')) product = 'Chrome';
    else if (browserName?.includes('Firefox')) product = 'Mozilla'; // Map Firefox to Mozilla
    else if (browserName?.includes('Safari') && !browserName?.includes('Chrome')) product = 'Safari'; // Ensure it's not Chrome pretending to be Safari
    else if (browserName?.includes('Edg')) product = 'Edge'; // Chromium Edge
    else if (browserName?.includes('Edge')) product = 'Edge'; // Legacy Edge
    // Add more mappings if needed

    // Map OS name to schema enum
    let osType: string | null = null;
    if (osName?.includes('Windows')) osType = 'Windows NT'; // Map to Windows NT
    else if (osName?.includes('Mac OS')) osType = 'Macintosh'; // Map to Macintosh
    else if (osName?.includes('Linux')) osType = 'Linux';
    else if (osName?.includes('iOS')) osType = 'iOS';
    else if (osName?.includes('Android')) osType = 'Android';
    // Add more mappings if needed

    // Determine Device Type (Simple guess based on OS/device info)
    let deviceType: string = 'Unknown';
    if (deviceTypeRaw === 'mobile' || osType === 'iOS' || osType === 'Android') {
        deviceType = 'Mobile';
    } else if (deviceTypeRaw === 'tablet') {
        deviceType = 'Tablet'; // Assuming Tablet is a valid enum, else map to Mobile or Desktop
    } else if (osType === 'Windows NT' || osType === 'Macintosh' || osType === 'Linux') {
        deviceType = 'Desktop';
    }

    // Extract viewport dimensions from first Meta or FullSnapshot event
    let viewportWidth: number | null = null;
    let viewportHeight: number | null = null;
    const firstMetaOrSnapshot = events.find((e: any) => e.type === EventType.Meta || e.type === EventType.FullSnapshot);
    if (firstMetaOrSnapshot?.type === EventType.Meta) {
        viewportWidth = firstMetaOrSnapshot.data.width;
        viewportHeight = firstMetaOrSnapshot.data.height;
    } else if (firstMetaOrSnapshot?.type === EventType.FullSnapshot) {
        // FullSnapshot doesn't directly contain viewport width/height in rrweb
        // It has initialOffset top/left, but not viewport size.
        // We might need to find the first ViewportResize event if Meta is missing.
        const firstResize = events.find((e: any) => e.type === EventType.IncrementalSnapshot && e.data.source === 4); // 4 = ViewportResize
        if (firstResize) {
            viewportWidth = firstResize.data.width;
            viewportHeight = firstResize.data.height;
        }
    }

    // --- Database Insertion ---
    // Phase 1: Insert into replay table only
    const query = `
      INSERT INTO replay (
        replay_id, html_hash, start_time, end_time, product, product_version, 
        device_type, os_type, os_version, network_id, 
        d_viewport_width, d_viewport_height
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    params = [
      replayId,
      htmlHash,
      startTime,
      endTime,
      product,
      browserVersion,
      deviceType,
      osType,
      osVersion,
      ipAddress,
      viewportWidth,
      viewportHeight
    ];

    // Execute query (consider adding transaction logic later for Phase 2)
    await sql.query(query, params);

    // TODO: Phase 2 - Parse full event stream and insert into detailed tables

    // --- Response ---
    return new Response(JSON.stringify({ message: "Recording saved successfully", replayId: replayId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Error saving replay:", error);
    return new Response(JSON.stringify({ message: `Error saving replay: ${error.message}`, body: body, params: params }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 