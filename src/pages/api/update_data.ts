import type { APIRoute } from "astro";
import { sql } from "../../lib/mysql-connect";

export const POST: APIRoute = async ({ request }) => {
  console.log("[API /api/update_data] Received request");
  let updatePayload;

  try {
    updatePayload = await request.json();

    // --- Basic Validation ---
    if (!Array.isArray(updatePayload) || updatePayload.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid payload: Expected a non-empty array of updates." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[API /api/update_data] Processing ${updatePayload.length} updates.`);

    const results = [];
    let overallSuccess = true;
    let errors = [];

    // --- Process each update --- 
    // TODO: Consider wrapping in a transaction if needed
    for (const update of updatePayload) {
      const { table, pk, updates } = update;

      // Validate individual update object
      if (!table || typeof table !== 'string' || !pk || typeof pk !== 'object' || !updates || typeof updates !== 'object' || Object.keys(pk).length !== 1 || Object.keys(updates).length === 0) {
        overallSuccess = false;
        errors.push({ error: "Invalid update object structure", item: update });
        continue; // Skip this invalid update
      }

      const pkColumn = Object.keys(pk)[0];
      const pkValue = pk[pkColumn];
      const updateEntries = Object.entries(updates);
      
      // For simplicity, handling only one update field per object for now
      // A more robust implementation would handle multiple fields in the 'updates' object
      if (updateEntries.length !== 1) {
        overallSuccess = false;
        errors.push({ error: "Invalid update structure: Only one field update per entry is currently supported.", item: update });
        continue;
      }

      const [fieldToUpdate, newValue] = updateEntries[0];
      
      // --- Construct and Execute Query --- 
      // WARNING: Directly interpolating table/column names can be risky if not controlled.
      // Ensure 'table', 'pkColumn', 'fieldToUpdate' are derived from trusted sources or validated.
      const query = `UPDATE ?? SET ?? = ? WHERE ?? = ?`; 
      const queryParams = [table, fieldToUpdate, newValue, pkColumn, pkValue];

      try {
        console.log(`[API /api/update_data] Executing query: UPDATE ${table} SET ${fieldToUpdate} = ? WHERE ${pkColumn} = ?`, [newValue, pkValue]);
        const [result]: any = await sql.query(query, queryParams);
        console.log(`[API /api/update_data] Query result for PK ${pkValue}:`, result);
        if (result.affectedRows === 0) {
             // This might mean the row wasn't found or the value was already the same
             console.warn(`[API /api/update_data] Update for ${table}.${fieldToUpdate} (PK: ${pkValue}) affected 0 rows.`);
             // Consider if this should be an error depending on requirements
        }
        results.push({ pk: pkValue, success: true, affectedRows: result.affectedRows });
      } catch (dbError: any) {
        console.error(`[API /api/update_data] Database error updating PK ${pkValue}:`, dbError);
        overallSuccess = false;
        errors.push({ 
          pk: pkValue, 
          success: false, 
          error: dbError.message || "Database error", 
          code: dbError.code 
        });
      }
    }

    // --- Return Response --- 
    if (overallSuccess) {
      console.log(`[API /api/update_data] All updates processed successfully.`);
      return new Response(JSON.stringify({ success: true, results }), { status: 200 });
    } else {
      console.error(`[API /api/update_data] Some updates failed.`, errors);
      return new Response(
        JSON.stringify({ success: false, error: "One or more updates failed.", details: errors }), 
        { status: 400 } // Use 400 Bad Request as some operations failed likely due to bad input or state
      );
    }

  } catch (error: any) {
    console.error("[API /api/update_data] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Server error processing updates." }),
      { status: 500 }
    );
  }
}; 