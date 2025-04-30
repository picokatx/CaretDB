import type { APIRoute } from "astro";
import { sql } from "../../lib/mysql-connect";
import { sqlQueries } from "../../lib/sql_query_locale";

export const POST: APIRoute = async ({ request }) => {
  const buildSchemaQuery = sqlQueries.buildSchemaQuery;
  

  if (!buildSchemaQuery) {
      console.error("Build Schema Error: SQL query is empty.");
      return new Response(
          JSON.stringify({ success: false, error: "Internal configuration error: Schema build query not defined." }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
  }

  try {
    // Execute the schema building query
    // Note: This might be a multi-statement query or require specific handling depending on the DB setup.
    // Using `sql.query` might need adjustment if multiple statements are involved.
    const [result, fields] = await sql.query(buildSchemaQuery);

    // Successful execution
    return new Response(
      JSON.stringify({
        success: true,
        message: "Schema build process initiated successfully.",
        // Optionally return parts of the result if relevant
        // result: result 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error("Build Schema SQL Query Error:", error);

    // Determine appropriate status code, could be 400 for syntax errors, 500 for others
    const statusCode = error.code && error.code.startsWith('ER_') ? 400 : 500;

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unexpected error occurred during schema building.",
        sqlState: error.sqlState,
        errorCode: error.code
      }),
      { status: statusCode, headers: { 'Content-Type': 'application/json' } }
    );
  }
}; 