---
title: SQL Queries Overview
description: How predefined SQL queries are structured and used.
---

Database interactions from the application (primarily via the `/api/query_mysql` endpoint) are generally performed using a predefined set of named SQL queries, rather than executing arbitrary SQL strings.

This library of queries is defined in the `sqlQueries` object within `src/lib/sql_query_locale.ts`.

## Approach & Benefits

Using predefined queries offers several advantages:

-   **Security:** Prevents direct execution of arbitrary SQL from the frontend or API calls, significantly mitigating SQL injection risks.
-   **Maintainability:** Centralizes database logic. SQL can be updated or optimized in `sql_query_locale.ts` without requiring changes in every place the query is used.
-   **Consistency:** Ensures data fetching and modification follow established patterns.
-   **Abstraction:** Frontend or API code only needs to reference a query by its name (e.g., `countUsers`), without needing to know the complex SQL involved.

## Query Categories

The queries in `sql_query_locale.ts` generally fall into several categories:

-   **Data Insertion:** Saving new records related to users, webstates, replays, events, nodes, network requests, etc. (e.g., `insertUser`, `insertReplay`, `insertSerializedNode`).
-   **Data Retrieval (Lists):** Fetching lists of items, often for display in tables or dropdowns (e.g., `listReplays`, `listMonthlyReports`, `listWebstateHashes`).
-   **Data Retrieval (Single Item):** Fetching specific records based on an ID or other criteria (e.g., `getUserPasswordHash`).
-   **Data Aggregation/Analytics:** Queries that count, sum, or average data, often involving joins and grouping (e.g., `countUsers`, `clickEventsOverTime`, `clicksPerReplay`).
-   **Data Updates:** Modifying existing records (e.g., `updateUserPrivacyMask`, `updateUsernameByEmail`).
-   **Schema Management:** Queries related to database structure (primarily `buildSchemaQuery`).

## Detailed Query Documentation

-   For a complete list and definition of **all** queries, refer to the **[Query Definitions](./query-definitions/)** page, which aims to mirror the content of `sql_query_locale.ts`.
-   For detailed explanations of the more complex or significant queries, including their purpose, parameters, results, and usage context, see the **[Query Details](./query-details/)** section.

## Adding New Queries

1.  Define the SQL query string carefully, testing it directly against the database if possible.
2.  Add a descriptive key (e.g., `getUsersWithRecentActivity`) and the SQL string as its value to the `sqlQueries` object in `src/lib/sql_query_locale.ts`.
3.  Update the relevant documentation pages ([Query Definitions](./query-definitions/) and potentially [Query Details](./query-details/) if complex).
4.  Use the new key in frontend fetch requests to `/api/query_mysql` or directly in backend logic. 