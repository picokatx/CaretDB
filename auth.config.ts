import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import { defineConfig } from 'auth-astro';
import { sql } from './src/lib/mysql-connect';
import type { FieldPacket, QueryResult, RowDataPacket } from 'mysql2';
import type { User } from '@auth/core/types';
import { CredentialsSignin } from '@auth/core/errors';
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Add user id (now email) from authorize to the token
      }
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