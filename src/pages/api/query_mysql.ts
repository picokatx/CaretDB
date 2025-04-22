import type { APIRoute } from "astro";
import { sql } from "../../lib/mysql-connect";

export const POST: APIRoute = async ({ request }) => {
    const req_params = await request.json();
    const [result, fields] = await sql.query(req_params.query);
    return new Response(
      JSON.stringify({
        rows: result,
        request_json: JSON.stringify(req_params)
      }),
    );
  };