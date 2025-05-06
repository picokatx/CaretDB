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
import type { AuthConfig, Session } from "@auth/core/types";
import { sqlQueries } from "./src/lib/sql_query_locale";

// Custom error class for login failures
class LoginError extends CredentialsSignin {
  code: string;
  constructor(code = "CredentialsSignin") {
    super(); // Call the base class constructor
    this.code = code; // Set the custom error code
  }
}

// Helper function to split email
const splitEmail = (email: string): { name: string | null, domain: string | null } => {
  if (!email || !email.includes('@')) {
    return { name: null, domain: null };
  }
  const [name, domain] = email.split('@', 2);
  return { name, domain };
};

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
          email: userEmail,
          role: users[0].role // <-- Add role from database
        };
      }
    })
  ],
  // Add callbacks to include user ID in the session
  callbacks: {
    // Include user.id on token, and refresh username on token update
    async jwt({ token, user, account, profile }) {
      // Persist the OAuth access_token and provider to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      // If user object exists (sign in), try to fetch role
      if (user && user.email) {
        console.log(`[JWT Callback] User signed in: ${user.email}. Fetching role...`);
        const { name: email_name, domain: email_domain } = splitEmail(user.email);
        if (email_name && email_domain) {
          try {
            const [rows]: [any[], any] = await sql.query(
              sqlQueries.selectUserRoleByEmail,
              [email_name, email_domain]
            );
            if (rows && rows.length > 0 && rows[0].role) {
              token.role = rows[0].role; // Add role to the token
              console.log(`[JWT Callback] Role fetched: ${token.role}`);
            } else {
               console.log(`[JWT Callback] Role not found in DB for ${user.email}`);
               token.role = 'user'; // Assign default role if not found? Or handle downstream?
            }
          } catch (dbError) {
            console.error("[JWT Callback] Database error fetching role:", dbError);
            // Decide how to handle DB errors during login - fail login? proceed without role?
             token.role = 'user'; // Assign default role on error for now
          }
        } else {
          console.warn(`[JWT Callback] Could not parse email: ${user.email}`);
           token.role = 'user'; // Assign default if email is weird
        }
      }
      return token;
    },
    // Include user.id and updated name on session
    async session({ session, token }) {
      // Send properties to the client, like role and provider
      if (token.provider && session.user) {
        session.provider = token.provider as string;
      }
      if (token.role && session.user) {
        session.user.role = token.role as string; // Add role to session user object
      }
       if (token.sub && session.user) {
         session.user.id = token.sub; // Add user id (subject) to session
       }
      return session;
    },
  },
  // Explicitly set strategy (optional but good practice)
  session: {
    strategy: "jwt",
  },
}) satisfies AuthConfig;