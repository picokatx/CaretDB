import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import { defineConfig } from 'auth-astro';
import { sql } from './src/lib/mysql-connect';
import type { FieldPacket, QueryResult, RowDataPacket } from 'mysql2';
import type { User } from '@auth/core/types';
import { CredentialsSignin } from '@auth/core/errors';
import { skipCSRFCheck } from '@auth/core';
import { createHash } from 'crypto';

// Custom error class for login failures
class LoginError extends CredentialsSignin {
  code: string;
  constructor(code = "CredentialsSignin") {
    super(); // Call the base class constructor
    this.code = code; // Set the custom error code
  }
}

export default defineConfig({
  skipCSRFCheck: skipCSRFCheck,
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, request) {

        const [result] = await sql.query(
          'SELECT * FROM user WHERE email_name = ? and email_domain = ?',
          [
            (credentials.email as string).split('@')[0],
            (credentials.email as string).split('@')[1]
          ]
        );

        // Cast result to RowDataPacket array
        const users = result as RowDataPacket[];

        // Check if user exists
        if (users.length !== 1) {
          // Throw specific error code if email not found
          throw new LoginError("InvalidEmail");
        }
        
        // User found, now hash the input password and check against stored hash
        const inputPasswordHash = createHash('sha256').update(credentials.password as string).digest('hex');

        if (users[0].password !== inputPasswordHash) {
          // Throw error if password incorrect
           throw new LoginError("IncorrectPassword");
        }
        
        // If email and password are correct, return user object
        // Use the full email as the stable unique ID for the session.
        const userEmail = users[0].email_name + "@" + users[0].email_domain;
          return {
          id: userEmail,
          name: users[0].username, // Keep username as name
          email: userEmail
        };
      }
    })
  ],
  // Add callbacks to include user ID in the session
  callbacks: {
    // Include user.id on token, and refresh username on token update
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in: Add user details to the token
      if (user) { 
        token.id = user.id; // user.id is the email from authorize
        token.name = user.name; // Store initial username
        token.email = user.email;
      }

      // If trigger is "update" and session data is provided (like from client-side update call)
      // This pattern is more common in Next.js. In Astro, we might rely on re-fetching.
      // For simplicity and security with Astro's server-side session handling,
      // let's prioritize re-fetching based on the ID when the token is used.

      // Re-fetch user data if token exists (meaning it's not initial login)
      // This ensures the name is up-to-date when the token is verified/used later.
      if (token?.id) { // Check if token exists and has the user ID (email)
        try {
          const email = token.id as string;
          const emailParts = email.split('@');
          if (emailParts.length === 2) {
            const [dbResult] = await sql.query(
              'SELECT username FROM user WHERE email_name = ? AND email_domain = ? LIMIT 1',
              [emailParts[0], emailParts[1]]
            );
            const users = dbResult as RowDataPacket[];
            if (users.length === 1) {
              token.name = users[0].username; // Update token name with latest from DB
            }
          }
        } catch (error) {
          console.error("Error re-fetching user data for JWT:", error);
          // Decide how to handle error: maybe keep old name, maybe invalidate token?
          // Keeping old name is safer for now.
        }
      }

      return token;
    },
    // Include user.id and updated name on session
    async session({ session, token }) {
      if (token?.id && session?.user) {
        session.user.id = token.id as string; // Add id (email) from token to session user
        session.user.name = token.name as string; // Add potentially updated name from token
        session.user.email = token.email as string; // Ensure email is also present
      }
      return session;
    },
  },
  // Explicitly set strategy (optional but good practice)
  session: {
    strategy: "jwt",
  },
});