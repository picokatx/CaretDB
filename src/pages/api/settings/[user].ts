import type { APIRoute } from "astro";
import { getSession } from "auth-astro/server";
import { sql } from "../../../lib/mysql-connect";
import { sqlQueries } from "../../../lib/sql_query_locale";

// GET handler to fetch current setting
export const GET: APIRoute = async ({ request, params }) => {
  const email = params.user;
  if (!email) {
    return new Response(JSON.stringify({ error: "Unauthorized"}), { status: 401 });
  }

  // Split email into name and domain
  const emailParts = email.split('@');
  if (emailParts.length !== 2) {
    return new Response(JSON.stringify({ error: "Invalid user email format" }), { status: 400 });
  }
  const email_name = emailParts[0];
  const email_domain = emailParts[1];

  try {
    const [rows]: any[] = await sql.query(sqlQueries.getUserPrivacyMask, [email_domain, email_name]);
    
    if (rows && rows.length > 0) {
      const setting = rows[0].privacy_mask;
      // Convert TINYINT(1) to boolean if needed
      const privacyMask = Boolean(setting);
      return new Response(JSON.stringify({ privacyMask }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "User setting not found", query: sqlQueries.getUserPrivacyMask, params: [email_domain, email_name] }), { status: 404 });
    }
  } catch (error: any) {
    console.error("Error fetching user settings:", error);
    return new Response(JSON.stringify({ error: "Database error fetching settings" }), { status: 500 });
  }
};

// POST handler to update setting
export const POST: APIRoute = async ({ request, params }) => {
  const email = params.user;

  if (!email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Split email
  const emailParts = email.split('@');
  if (emailParts.length !== 2) {
     return new Response(JSON.stringify({ error: "Invalid user email format" }), { status: 400 });
  }
  const email_name = emailParts[0];
  const email_domain = emailParts[1];

  try {
    const body = await request.json();
    const { privacyMask } = body;

    // Basic validation
    if (typeof privacyMask !== 'boolean') {
      return new Response(JSON.stringify({ error: "Invalid privacyMask value" }), { status: 400 });
    }

    await sql.query(sqlQueries.updateUserPrivacyMask, [privacyMask, email_domain, email_name]);

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error: any) {
    console.error("Error updating user settings:", error);
    // Check for specific SQL errors if needed (e.g., constraint violations)
    return new Response(JSON.stringify({ error: "Database error updating settings" }), { status: 500 });
  }
}; 