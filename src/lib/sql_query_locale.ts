import * as fs from 'node:fs';
import buildSchemaSqlContent from './build_schema.sql?raw'; // Use Vite's raw import


export const sqlQueries = {
  // webstate queries
  insertWebstateHash: 'INSERT INTO webstate (html_hash) VALUES (?)',

  // user queries
  selectUserByEmailOrUsername: 'SELECT 1 FROM user WHERE (email_name = ? AND email_domain = ?) OR username = ? LIMIT 1',
  insertUser: `INSERT INTO user (
    email_domain, email_name, username, password, 
    created_at, status, role, verified, fail_login, twofa
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  // Load the build schema query from the SQL file
  buildSchemaQuery: buildSchemaSqlContent,
}; 