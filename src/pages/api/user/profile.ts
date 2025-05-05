import type { APIRoute } from "astro";
import { getSession } from "auth-astro/server";
import { sql } from "../../../lib/mysql-connect"; 
import { sqlQueries } from "../../../lib/sql_query_locale"; 

// Handler to update user profile data (e.g., display name)
export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);

  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  // Split email
  const emailParts = session.user.email.split('@');
  if (emailParts.length !== 2) {
     return new Response(JSON.stringify({ error: "Invalid user email format" }), { status: 400 });
  }
  const email_name = emailParts[0];
  const email_domain = emailParts[1];

  try {
    const body = await request.json();
    const { displayName } = body;

    // --- Basic Validation --- 
    if (!displayName || typeof displayName !== 'string' || displayName.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Invalid displayName value" }), { status: 400 });
    }
    // Add more validation if needed (length, allowed characters etc.)
    const newUsername = displayName.trim();
    // Example: Check length (assuming DB constraints match)
    if (newUsername.length < 3 || newUsername.length > 30) { 
         return new Response(JSON.stringify({ error: "Display name must be between 3 and 30 characters." }), { status: 400 });
    }
    // Potential check for username regex/reserved words if applicable
    // const usernameRegex = /^(?=.*[a-za-z])[a-z0-9_\-\.']{3,30}$/i; 
    // const reservedUsernames = ['admin', 'root', 'system', 'administrator'];
    // if (!usernameRegex.test(newUsername) || reservedUsernames.includes(newUsername.toLowerCase())) {
    //    return new Response(JSON.stringify({ error: "Invalid display name format or reserved name." }), { status: 400 });
    // }

    // --- Database Update --- 
    const [result]: any = await sql.query(sqlQueries.updateUserDisplayName, [newUsername, email_domain, email_name]);

    if (result.affectedRows === 0) {
       console.warn(`Attempted to update display name for ${session.user.email} but no rows were affected.`);
       // Consider if this should be an error or just a silent ignore
       return new Response(JSON.stringify({ error: "User not found or name unchanged" }), { status: 404 });
    }

    // --- Session Update (Server-side - Not Directly Supported by auth-astro for immediate effect) --- 
    // Auth.js/NextAuth session update typically happens via callbacks or specific update functions.
    // auth-astro doesn't expose a direct server-side `update` like next-auth/react.
    // The session *should* reflect the change on the *next* request that reads the session (e.g., page load) 
    // because the database was updated.
    // We cannot easily force-update the *current* active session token from this API endpoint.
    
    console.log(`Display name updated for ${session.user.email} to ${newUsername}`);
    return new Response(JSON.stringify({ success: true, newName: newUsername }), { status: 200 });

  } catch (error: any) {
    console.error(`Error updating user profile for ${session.user.email}:`, error);
    // Check for specific SQL errors like unique constraint violation if username must be unique
    // if (error.code === 'ER_DUP_ENTRY') { ... }
    return new Response(JSON.stringify({ error: "Database error updating profile" }), { status: 500 });
  }
}; 