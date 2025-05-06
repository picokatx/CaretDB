// src/pages/api/process-csv.ts
import type { APIRoute } from 'astro';
import { readFile } from 'node:fs/promises';
import pkg from 'papaparse';
import { sql } from "../../lib/mysql-connect";
import { sqlQueries } from "../../lib/sql_query_locale";
import path from 'path';
import type { number } from 'astro:schema';
import { z } from 'zod'; // For validation

export const POST: APIRoute = async () => {
  const {parse} = pkg;

  try {
    const [rows] = await sql.query<any[]>("SHOW TABLES;");

    console.log(rows);

    for(const i of rows){
      const tableName = i.Tables_in_caretdb

      const inputDir = path.join(process.cwd(), 'export');
      const inputPath = path.join(inputDir, tableName + '.csv');
      var csvFile = await readFile(inputPath, 'utf-8');

      //csvFile = csvFile.replace('\r', '')
      //csvFile = csvFile.replace('\r\n', '')

      console.log("Start of file");
      //console.log(csvFile);
      if(csvFile.length==0) continue;
      console.log("Success");

      const parseResult = parse(csvFile,{	delimiter: ",",newline: "\r\n",header: true});
  
      if(parseResult.data.length == 0) continue;
      if (parseResult.errors.length > 0) {
        throw new Error(`CSV Parse errors: ${parseResult.errors.map(e => e.message).join(', ')}`);
      }

/*
    insert into console_log (
      log_id, replay_id, level, payload, delay, timestamp, trace
    ) values (?, ?, ?, ?, ?, ?, ?);
*/
      console.log(parseResult.meta.fields);
    const headers = parseResult.meta.fields;

    if(!headers) continue;

    const rowSchema = z.object(
      Object.fromEntries(
        headers.map(header => [header, z.unknown()])
      ) 
    );

    

    // 4. Validate and prepare data
    const validatedData = parseResult.data.map(row => {
      const parsed = rowSchema.parse(row);
      return headers.map(header => parsed[header]);
    });

    // 5. Generate dynamic SQL query
    const columns = headers.map(h => `\`${h}\``).join(', ');
    const placeholders = headers.map(() => '?').join(', ');

    const result = await sql.query(
      `INSERT INTO ` + tableName +  ` (${columns}) VALUES ${validatedData.map(() => `(${placeholders})`).join(', ')}`,
      validatedData.flat()
    );
     
    console.log(placeholders);
    console.log(validatedData.flat());
    }

    return new Response(JSON.stringify({
      success: true
    }), { status: 200 });
  } 
  catch (error) {
    console.error('Processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'File processing failed'
    }), { status: 500 });
  }
}
;