import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';
import { defineConfig } from 'auth-astro';
import { sql } from './src/lib/mysql-connect';
import type { FieldPacket, QueryResult } from 'mysql2';
import type { User } from '@auth/core/types';

export default defineConfig({
  providers: [
    Google({
      clientId: import.meta.env.GOOGLE_CLIENT_ID,
      clientSecret: import.meta.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {

        const [result, fields]: [QueryResult, FieldPacket[]] = await sql.query(
          'SELECT * FROM user WHERE email_name = ? and email_domain = ?',
          [
            (credentials.email as string).split('@')[0],
            (credentials.email as string).split('@')[1]
          ]
        );
        if (result.length==1 && result[0].password === credentials.password) {
          const user_func = async (): Promise<User> => {
            return {
              id: result[0].user_id,
              name: result[0].username,
              email: result[0].email_name+"@"+result[0].email_domain
            }
          };
          return user_func();
        } else {
          return null;
        }
        // if (result.length==1 && result[0].password === credentials.password) {
        //   const user: User = {
        //     id: result[0].user_id,
        //   }
        //   return new Response(JSON.stringify(user));
        // } else {
        //   return new Response(JSON.stringify({error: "Invalid credentials"}), {status: 401});
        // }
      }
    })
  ],
});