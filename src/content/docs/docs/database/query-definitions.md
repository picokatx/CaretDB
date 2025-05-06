---
title: SQL Query Definitions (`sql_query_locale.ts`)
description: Details about the file containing predefined SQL queries.
---

The file `src/lib/sql_query_locale.ts` plays a crucial role in managing database interactions securely and centrally.

## Purpose

- **Centralization:** It acts as a single source of truth for all SQL queries used by the application's backend API (`/api/query_mysql`).
- **Abstraction:** It maps simple string identifiers (keys) to potentially complex SQL query strings (values).
- **Security:** By only allowing queries defined in this file to be executed via the API, it prevents arbitrary SQL execution and mitigates SQL injection vulnerabilities.

## Structure

The file typically exports an object (e.g., `sqlQueries`) where:

- **Keys:** Are short, descriptive strings representing the query's purpose (e.g., `countUsers`, `listRecentReplays`, `getReportById`). These are the identifiers sent in the request body to the `/api/query_mysql` endpoint.
- **Values:** Are the corresponding raw SQL query strings.

```typescript
// Example structure within src/lib/sql_query_locale.ts

export const sqlQueries = {
  countUsers: "SELECT COUNT(*) as count FROM users;",

  listRecentReplays: `
    SELECT 
      replay_id, 
      DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') as start_time_formatted 
    FROM replays 
    ORDER BY start_time DESC 
    LIMIT 10;
  `,

  // ... other query identifiers and their SQL strings
};
```

## Usage

1.  The frontend (e.g., `dashboard.astro`) makes a POST request to `/api/query_mysql`.
2.  The request body includes a `query` field containing one of the keys defined in `sqlQueries` (e.g., `{ "query": "listRecentReplays" }`).
3.  The `/api/query_mysql` endpoint retrieves the corresponding SQL string from the imported `sqlQueries` object.
4.  It executes this predefined SQL string against the database.
5.  The results are returned to the frontend.

## Maintenance

- When adding a new database query needed by the frontend, add a new key-value pair to the `sqlQueries` object.
- When modifying an existing query, update the SQL string associated with the relevant key.
- Ensure keys are unique and descriptive. 