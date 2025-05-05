import type { APIRoute } from "astro";
import { sql } from "../../../lib/mysql-connect";
import { sqlQueries } from "../../../lib/sql_query_locale";

export const POST: APIRoute = async ({ request }) => {
  let email: string | null = null;
  try {
    const body = await request.json();
    const { email: bodyEmail, displayName } = body;

    // --- Basic Validation ---
    if (!bodyEmail || typeof bodyEmail !== 'string' || !displayName || typeof displayName !== 'string') {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields (email, displayName)." }), { status: 400 });
    }
    email = bodyEmail;
    const newUsername = displayName.trim();

    // --- Username Validation (similar to registration, adjust as needed) ---
    const usernameRegex = /^(?=.*[a-zA-Z])[a-z0-9_\-\.']{3,30}$/i; // Allow uppercase too
    const reservedUsernames = ['admin', 'root', 'system', 'administrator'];
    if (!usernameRegex.test(newUsername) || reservedUsernames.includes(newUsername.toLowerCase())) {
      return new Response(JSON.stringify({ success: false, error: "Invalid username format or reserved name." }), { status: 400 });
    }

    // --- Split email ---
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      return new Response(JSON.stringify({ success: false, error: "Invalid user email format." }), { status: 400 });
    }
    const email_name = emailParts[0];
    const email_domain = emailParts[1];

    // --- Check if username already exists (optional, depending on if usernames must be unique globally) ---
    // If usernames must be unique across *all* users:
    // const [existingUsersResult] = await sql.query(
    //   'SELECT 1 FROM user WHERE username = ? AND NOT (email_name = ? AND email_domain = ?) LIMIT 1',
    //   [newUsername, email_name, email_domain]
    // );
    // const existingUsers = existingUsersResult as any[];
    // if (existingUsers.length > 0) {
    //   return new Response(JSON.stringify({ success: false, error: "Username already taken." }), { status: 409 }); // Conflict
    // }

    // --- Update Username in Database ---
    const [updateResult]: any = await sql.query(sqlQueries.updateUsernameByEmail, [
      newUsername, 
      email_domain, 
      email_name
    ]);

    if (updateResult.affectedRows === 0) {
       // This could happen if the email didn't match any user, though session check should prevent this.
       return new Response(JSON.stringify({ success: false, error: "User not found or username unchanged." }), { status: 404 });
    }

    // --- Success --- 
    // We return the updated name for the client to use
    return new Response(JSON.stringify({ success: true, newName: newUsername }), { status: 200 });

  } catch (error: any) {
    console.error(`Error updating username for ${email}:`, error);
    // Check for duplicate username error specifically if you added that check
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage?.includes('username')) {
         return new Response(JSON.stringify({ success: false, error: "Username already taken." }), { status: 409 });
    }
    return new Response(JSON.stringify({ success: false, error: "Server error updating username." }), { status: 500 });
  }
}; 