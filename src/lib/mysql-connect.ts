import mysql from 'mysql2/promise';
// Create the connection to database
export const sql = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'caretdb',
  multipleStatements: true
});