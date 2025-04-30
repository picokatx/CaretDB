import * as fs from 'node:fs';

// Read the SQL file content synchronously
const buildSchemaSqlContent = fs.readFileSync('src/lib/build_schema.sql', 'utf-8');

export const sqlQueries = {
  // webstate queries
  insertWebstateHash: 'INSERT INTO webstate (html_hash) VALUES (?)',

  // user queries
  selectUserByEmailOrUsername: 'SELECT user_id FROM user WHERE (email_name = ? AND email_domain = ?) OR username = ?',
  insertUser: `INSERT INTO user (
    user_id, email_domain, email_name, username, password, 
    created_at, status, role, verified, fail_login, twofa
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  // Load the build schema query from the SQL file
  buildSchemaQuery: buildSchemaSqlContent,
}; 