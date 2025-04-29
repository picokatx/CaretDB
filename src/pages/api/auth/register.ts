import type { APIRoute } from "astro";
import { sql } from "../../../lib/mysql-connect"; // Adjust path as needed
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import type { RowDataPacket } from 'mysql2'; // Import RowDataPacket

// Helper function for validation errors
const validationError = (message: string, formData?: FormData) => {
  const params = new URLSearchParams();
  params.set("error", message);
  if (formData) {
    params.set("username", formData.get("username") as string || '');
    params.set("email", formData.get("email") as string || '');
  }
  return new Response(null, {
    status: 302, // Found (Redirect)
    headers: {
      Location: `/register?${params.toString()}`,
    },
  });
};

export const POST: APIRoute = async ({ request, redirect }) => {
  let formData;
  try {
    formData = await request.formData();
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    // --- Basic Validation ---
    if (!username || !email || !password || !confirmPassword) {
      return validationError("Please fill in all fields.", formData);
    }
    if (password !== confirmPassword) {
      return validationError("Passwords do not match.", formData);
    }
    if (password.length < 6) {
      return validationError("Password must be at least 6 characters long.", formData);
    }

    // --- Email Validation ---
    const emailParts = email.toLowerCase().split('@');
    if (emailParts.length !== 2) {
        return validationError("Invalid email format.", formData);
    }
    const emailName = emailParts[0];
    const emailDomain = emailParts[1];
    // Very basic domain check (DB has stricter regex)
    if (!emailDomain || emailDomain.length < 3 || !emailDomain.includes('.')) {
       return validationError("Invalid email domain.", formData);
    }
    // Basic name check (DB has stricter regex)
    if (!emailName || emailName.length === 0) {
        return validationError("Invalid email name part.", formData);
    }

    // --- Username Validation ---
    const usernameRegex = /^(?=.*[a-zA-Z])[a-z0-9_\-\.']{3,30}$/;
    const reservedUsernames = ['admin', 'root', 'system', 'administrator'];
    if (!usernameRegex.test(username) || reservedUsernames.includes(username.toLowerCase())) {
      return validationError("Invalid username format or reserved name.", formData);
    }

    // --- Check for Existing User ---
    const [existingUsersResult] = await sql.query(
      'SELECT user_id FROM user WHERE (email_name = ? AND email_domain = ?) OR username = ?',
      [emailName, emailDomain, username]
    );
    // Explicitly cast to check length
    const existingUsers = existingUsersResult as RowDataPacket[]; 
    if (existingUsers.length > 0) {
       return validationError("Username or email already exists.", formData);
    }

    // --- Password Hashing (Placeholder - **USE A PROPER LIBRARY LIKE bcrypt in production!**) ---
    // IMPORTANT: Storing plain text or simple SHA256 is insecure. Implement bcrypt or Argon2.
    const hashedPassword = createHash('sha256').update(password).digest('hex');

    // --- Create User ---
    const userId = uuidv4().replace(/-/g, ''); // Generate UUID and remove hyphens for CHAR(32)
    const status = 'enabled';
    const role = 'user'; // Default role
    const createdAt = new Date(); // Use current timestamp

    await sql.query(
      `INSERT INTO user (
        user_id, email_domain, email_name, username, password, 
        created_at, status, role, verified, fail_login, twofa
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [
        userId, emailDomain, emailName, username, hashedPassword, 
        createdAt, status, role, false, 0, false // Default values
      ]
    );

    // --- Success --- 
    // Redirect to login page with a success message
    const successParams = new URLSearchParams();
    successParams.set("message", "Registration successful! Please login.");
    return redirect(`/login?${successParams.toString()}`);

  } catch (error: any) {
    console.error("Registration Error:", error);
    // Generic error redirect
    return validationError("An unexpected error occurred during registration.", formData);
  }
}; 