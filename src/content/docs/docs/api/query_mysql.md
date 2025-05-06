---
title: POST /api/query_mysql
description: Executes predefined SQL queries.
---

This endpoint is used by the frontend to fetch data from the MySQL database by sending predefined query identifiers.

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**

```json
{
  "query": "<query_identifier>"
}
```

- `query_identifier` (string, required): A key corresponding to a SQL query defined in `src/lib/sql_query_locale.ts` (e.g., `countUsers`, `listRecentReplays`).

**Success Response (200 OK):**

```json
{
  "success": true,
  "rows": [
    // Array of result objects, structure depends on the query
    // Example for countUsers:
    { "count": 123 }
    // Example for listRecentReplays:
    { "replay_id": "abc...", "start_time_formatted": "..." }
  ]
}
```

**Error Response (e.g., 400 Bad Request, 500 Internal Server Error):**

```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message",
    // Optional additional error details
  }
}
```

**Notes:**

- This endpoint acts as a controlled gateway to the database. Only predefined queries can be executed.
- Error handling is crucial on the frontend to display appropriate messages based on the response. 