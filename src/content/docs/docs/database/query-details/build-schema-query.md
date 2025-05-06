---
title: buildSchemaQuery
description: Explanation of the database schema initialization query.
---

This special query object doesn't contain a single, executable SQL statement in the traditional sense within the `sql_query_locale.ts` file itself. Instead, it holds the entire content of the `build_schema.sql` file.

## Purpose

The primary purpose of loading the `build_schema.sql` content into this variable is to make the complete database schema definition accessible to the application, likely for use in an API endpoint (e.g., `/api/build_schema`) that allows initializing or resetting the database.

## Content (`build_schema.sql`)

The `build_schema.sql` file contains the Data Definition Language (DDL) statements required to create the entire CaretDB database structure from scratch. This includes:

*   `DROP TABLE IF EXISTS ...;` statements to remove existing tables (ensuring a clean state).
*   `CREATE TABLE ...;` statements for all tables (e.g., `user`, `webstate`, `replay`, `event`, `serialized_node`, etc.).
*   Table definitions include column names, data types, constraints (PRIMARY KEY, FOREIGN KEY, NOT NULL, CHECK, ENUM), default values, and character set/collation settings.
*   `CREATE INDEX ...;` statements to define indexes for performance optimization on frequently queried columns.
*   Definitions for stored procedures (like `generate_monthly_report`).
*   Definitions for database events (like `monthly_report_scheduler`).
*   Definitions for triggers (like `before_input_data_insert_mask`).

## Usage Context

-   **API Endpoint (`/api/build_schema`):** This query content is most likely used by the `/api/build_schema` endpoint. When this endpoint is called, it executes the SQL statements contained within `buildSchemaQuery` against the connected MySQL database.
-   **Database Initialization:** This provides a programmatic way to set up the required database schema, essential for initial deployment or for resetting the database during development or testing.

## Execution Notes

-   Executing this query runs multiple SQL statements.
-   It is destructive, as it drops existing tables before recreating them.
-   Requires sufficient database privileges to create/drop tables, procedures, events, and triggers.

For the exact table structures and definitions, please refer directly to the [`build_schema.sql`](https://github.com/picokatx/CaretDB/blob/main/branches/main/src/lib/build_schema.sql) file or the individual table documentation pages in the [Tables](../tables/) section. 