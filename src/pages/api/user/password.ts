import type { APIRoute } from "astro";
// Use Node's crypto module for hashing, consistent with register.ts
import { createHash } from 'crypto'; 
import { sql } from "../../../lib/mysql-connect";
import { sqlQueries } from "../../../lib/sql_query_locale";

// Use SHA256 hashing consistent with registration
async function verifyPassword(plainPassword: string, hash: string): Promise<boolean> {
  const hashedInputPassword = createHash('sha256').update(plainPassword).digest('hex');
  return hashedInputPassword === hash;
}

async function hashPassword(plainPassword: string): Promise<string> {
  // Use the same SHA256 hashing method
  return createHash('sha256').update(plainPassword).digest('hex');
}

export const POST: APIRoute = async ({ request }) => {
  let email: string | null = null;
  try {
    const body = await request.json();
    const { email: bodyEmail, oldPassword, newPassword } = body;

    // --- Basic Validation ---
    if (!bodyEmail || typeof bodyEmail !== 'string' || !oldPassword || !newPassword) {
      return new Response(JSON.stringify({ success: false, error: "Missing required fields (email, oldPassword, newPassword)." }), { status: 400 });
    }
    email = bodyEmail;
    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ success: false, error: "New password must be at least 6 characters long." }), { status: 400 });
    }

    // --- Split email --- 
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
      return new Response(JSON.stringify({ success: false, error: "Invalid user email format" }), { status: 400 });
    }
    const email_name = emailParts[0];
    const email_domain = emailParts[1];

    // --- Verify Old Password ---
    const [userRows]: any[] = await sql.query(sqlQueries.getUserPasswordHash, [email_domain, email_name]);

    if (!userRows || userRows.length === 0) {
      return new Response(JSON.stringify({ success: false, error: "User not found." }), { status: 404 });
    }

    const currentHash = userRows[0].password;
    const isMatch = await verifyPassword(oldPassword, currentHash);

    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, error: "Incorrect current password." }), { status: 403 }); // Forbidden
    }

    // --- Update to New Password ---
    const newHash = await hashPassword(newPassword);
    await sql.query(sqlQueries.updateUserPasswordHash, [newHash, email_domain, email_name]);

    // --- Success --- 
    return new Response(JSON.stringify({ success: true, message: "Password updated successfully." }), { status: 200 });

  } catch (error: any) {
    console.error(`Error changing password for ${email}:`, error);
    return new Response(JSON.stringify({ success: false, error: "Server error changing password." }), { status: 500 });
  }
}; 