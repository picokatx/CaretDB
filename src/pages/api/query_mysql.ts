import type { APIRoute } from "astro";
import { sql } from "../../lib/mysql-connect";

export const POST: APIRoute = async ({ request }) => {
  let req_params;
  let queryToLog = "No query received"; // Variable to hold the query for logging

  try {
    req_params = await request.json();
    if (!req_params || typeof req_params.query !== 'string' || req_params.query.trim() === '') {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid 'query' parameter in request body." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    queryToLog = req_params.query; // Store the query for potential error logging

    const [result, fields] = await sql.query(req_params.query);

    // Successful query
    return new Response(
      JSON.stringify({
        success: true,
        rows: result,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("SQL Query Error:", error);

    const statusCode = error.code && error.code.startsWith('ER_') ? 400 : 500;
    
    // Include more error details if they exist
    const errorDetails = {
        message: error.message || "An unexpected error occurred.",
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
    };

    return new Response(
      JSON.stringify({
        success: false,
        error: errorDetails, // Use the enhanced error object
        query: queryToLog // Log the query that caused the error
      }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
};