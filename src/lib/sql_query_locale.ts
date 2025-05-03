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

  // Analysis queries
  countUsers: "SELECT COUNT(*) as count FROM user;",
  countWebstates: "SELECT COUNT(*) as count FROM webstate;",
  countReplays: "SELECT COUNT(*) as count FROM replay;",
  countEvents: "SELECT COUNT(*) as count FROM event;",
  eventsOverTime: "SELECT DATE(timestamp) as date, COUNT(event_id) as count FROM event GROUP BY DATE(timestamp) ORDER BY date ASC;",
  clickEventsOverTime: `
    SELECT 
        DATE(e.timestamp) as date, 
        COUNT(e.event_id) as count 
    FROM event e
    JOIN incremental_snapshot_event ise ON e.event_id = ise.event_id
    JOIN mouse_interaction_data mid ON ise.event_id = mid.event_id
    WHERE 
        ise.t = 'mouseinteraction' AND mid.interaction_type = 'click'
    GROUP BY DATE(e.timestamp)
    ORDER BY date ASC;
  `,
  clickEventsPerSecond: `
    SELECT 
        DATE_FORMAT(e.timestamp, '%Y-%m-%d %H:%i:%s') as second, 
        COUNT(e.event_id) as count 
    FROM event e
    JOIN incremental_snapshot_event ise ON e.event_id = ise.event_id
    JOIN mouse_interaction_data mid ON ise.event_id = mid.event_id
    WHERE 
        ise.t = 'mouseinteraction' AND mid.interaction_type = 'click'
    GROUP BY second
    ORDER BY second ASC;
  `
}; 