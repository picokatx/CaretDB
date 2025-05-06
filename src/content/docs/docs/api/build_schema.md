---
title: POST /api/build_schema
description: Executes the database schema build script.
---

This endpoint triggers the execution of the full database schema build script located in `src/lib/build_schema.sql`.

**WARNING:** Executing this endpoint typically **DROPS** and **RECREATES** all database tables. Use with extreme caution, especially in production environments.

**Method:** `POST`

**Request Body:** None required.

**Success Response (200 OK):**

Indicates that the schema build script was submitted for execution.

```json
{
  "success": true,
  "message": "Schema build process initiated successfully."
}
```

**Error Response (e.g., 400 Bad Request, 500 Internal Server Error):**

Indicates an error during the execution of the schema build script.

```json
{
  "success": false,
  "error": "Descriptive error message from the database (e.g., syntax error)",
  "sqlState": "SQL state code",
  "errorCode": "Database error code"
}
```

**Notes:**

- This endpoint relies on the `buildSchemaQuery` identifier being correctly defined in `src/lib/sql_query_locale.ts` and pointing to the content of `build_schema.sql`.
- The underlying database connection (`sql` from `mysql-connect`) must have sufficient privileges to drop and create databases/tables.
- This is primarily intended as a development or administrative tool. 