import type { APIRoute } from 'astro';
import { sql } from '../../lib/mysql-connect';
import pkg from 'papaparse';
import fs from 'fs/promises';  
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  let req_params;
  let queryToLog = "No query received"; // Variable to hold the query for logging
  console.log("We are here");
  try {
    req_params = await request.json();
    console.log(req_params.query);
    if (!req_params || typeof req_params.query !== 'string' || req_params.query.trim() === '') {
      return new Response(
        JSON.stringify({ success: false, error: "Missing or invalid 'query' parameter in request body." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log(req_params.query)
    queryToLog = req_params.query; // Store the query for potential error logging

    const [rows] = await sql.query<any[]>("SELECT * FROM " + req_params.query + ";");

    const { unparse } = pkg
    const csv         = unparse(rows);

    const outputDir = path.join(process.cwd(), 'export');
    const outputPath = path.join(outputDir, req_params.query + '.csv');

    // Ensure the directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Write the file
    await fs.writeFile(outputPath, csv, 'utf-8');
    

    // Successful query
    return new Response(
        JSON.stringify({
        success: true
      }),
      { status: 200, headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="export.csv"',
      }}
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