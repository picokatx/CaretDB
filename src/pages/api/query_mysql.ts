import type { APIRoute } from "astro";
import { sql } from "../../lib/mysql-connect";

export const POST: APIRoute = async ({ request }) => {
  let req_params;
  try {
    req_params = await request.json();
    if (!req_params || typeof req_params.query !== 'string' || req_params.query.trim() === '') {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid 'query' parameter in request body." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

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

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred.",
        query: req_params?.query
      }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
};