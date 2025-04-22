import type { APIRoute } from 'astro'
import { sql } from '../../lib/mysql-connect'
import type { QueryResult, FieldPacket } from 'mysql2';

export const POST: APIRoute = async ({ params, request }) => {
  const [query_result, field_packet] = await sql.query(`
    SELECT * FROM employee;
    `);

  return new Response(
    JSON.stringify({
      rows: query_result,
      request_params: params,
      request_body: request
    }),
  )
}