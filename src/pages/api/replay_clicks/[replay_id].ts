import type { APIRoute } from "astro";
import { sql } from "../../../lib/mysql-connect"; // Adjust path as needed
import type { RowDataPacket } from 'mysql2'; // Import RowDataPacket

// Define the expected structure of the data returned by the query
type ClickDataPoint = {
    second: string; // Format: 'YYYY-MM-DD HH:MM:SS'
    count: number;
};

export const GET: APIRoute = async ({ params }) => {
    const replay_id = params.replay_id; // Get replay_id from the URL path

    if (!replay_id) {
        return new Response(JSON.stringify({ error: "Missing replay_id parameter." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Basic validation for replay_id format (UUID)
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.json$/;
    if (!uuidRegex.test(replay_id)) {
        return new Response(JSON.stringify({ error: "Invalid replay_id format." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const query = `
        SELECT 
            DATE_FORMAT(e.timestamp, '%Y-%m-%d %H:%i:%s') as second, 
            COUNT(e.event_id) as count 
        FROM event e
        JOIN incremental_snapshot_event ise ON e.event_id = ise.event_id
        JOIN mouse_interaction_data mid ON ise.event_id = mid.event_id
        WHERE 
            e.replay_id = ? 
            AND ise.t = 'mouseinteraction' 
            AND mid.interaction_type = 'click'
        GROUP BY second
        ORDER BY second ASC;
    `;

    try {
        // Use query parameters to prevent SQL injection
        const [rows, fields] = await sql.query<RowDataPacket[]>(query, [replay_id.replace('.json', '')]);
        console.log(`[Debug] Query rows:`, replay_id, rows);
        return new Response(JSON.stringify({"rows": rows, "replay_id": replay_id}), { // Return the array directly
            status: 200,
            headers: { "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error(`SQL Error fetching clicks for replay ${replay_id}:`, error);
        const statusCode = error.code && error.code.startsWith('ER_') ? 400 : 500;
        const errorDetails = {
            message: error.message || "An unexpected error occurred.",
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
        };
        return new Response(JSON.stringify({ error: `Database error: ${errorDetails.message}`, params: params, errorObj: errorDetails}), {
            status: statusCode,
            headers: { "Content-Type": "application/json" },
        });
    }
}; 