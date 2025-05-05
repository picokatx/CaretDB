import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import { defineConfig } from 'auth-astro';
import { sql } from './src/lib/mysql-connect';
import type { FieldPacket, QueryResult, RowDataPacket } from 'mysql2';
import type { User } from '@auth/core/types';
import { CredentialsSignin } from '@auth/core/errors';
import { createHash } from 'crypto';
import type { JWT } from "@auth/core/jwt";
import type { Session } from "@auth/core/types";
import { sqlQueries } from "./src/lib/sql_query_locale";

// Custom error class for login failures
class LoginError extends CredentialsSignin {
  code: string;
  constructor(code = "CredentialsSignin") {
    super(); // Call the base class constructor
    this.code = code; // Set the custom error code
  }
}

export default defineConfig({
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
    // Include user.id on token
    async jwt({ token, user, account, profile, trigger }) {
      // Note: `user` object is usually only passed on initial sign-in.
      // `token` contains the existing JWT payload.
      
      // --- Initial sign-in or account linking --- 
      if (account && user?.email) {
        token.id = user.email; // Use email as the stable ID in the token
        // You might fetch the user's persisted username here too on first login
        const emailParts = user.email.split('@');
        if (emailParts.length === 2) {
          const [result]: any = await sql.query(sqlQueries.getUserByEmail, [emailParts[1], emailParts[0]]);
          if (result && result.length > 0 && result[0].username) {
            token.name = result[0].username; // Set name initially from DB
          }
        }
      }

      // --- On subsequent JWT reads/refreshes --- 
      // Always try to refresh the name from the database 
      // This ensures profile updates are reflected when the token is next used/validated
      if (token.id && typeof token.id === 'string') {
        try {
          const emailParts = token.id.split('@');
          if (emailParts.length === 2) {
            const [dbUserResult]: any = await sql.query(sqlQueries.getUserByEmail, [emailParts[1], emailParts[0]]);
            if (dbUserResult && dbUserResult.length > 0 && dbUserResult[0].username) {
              token.name = dbUserResult[0].username; // Update token name with latest from DB
              // console.log(`JWT Callback: Refreshed name for ${token.id} to ${token.name}`);
            } else {
              // Handle case where user might not exist anymore? 
              // console.warn(`JWT Callback: User ${token.id} not found in DB during refresh.`);
              // You might want to invalidate the token or clear the name here
               token.name = null; // Or keep the old one? Depends on desired behavior.
            }
          }
        } catch (error) {
          console.error("JWT Callback: Error fetching user data for refresh:", error);
          // Decide how to handle DB errors - potentially keep existing token name?
        }
      }

      // Return the (potentially updated) token
      return token;
    },
    // Include user.id on session
    async session({ session, token }) {
      if (token?.id && session?.user) {
        session.user.id = token.id as string; // Add id (email) from token to session user
      }
      return session;
    },
  },
  // Explicitly set strategy (optional but good practice)
  session: {
    strategy: "jwt",
  },
});