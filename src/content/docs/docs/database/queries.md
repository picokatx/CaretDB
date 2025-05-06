---
title: SQL Queries
description: Overview of predefined SQL queries used via the API.
---

Instead of allowing arbitrary SQL execution, the application uses a predefined set of queries managed in `src/lib/sql_query_locale.ts`.
The `/api/query_mysql` endpoint accepts an identifier corresponding to one of these queries.

This approach enhances security by preventing SQL injection and provides a central place to manage database interactions.

## Benefits of Predefined Queries

- **Security:** Prevents arbitrary SQL execution from the frontend, mitigating SQL injection risks.
- **Maintainability:** Database logic is centralized in `sql_query_locale.ts`, making it easier to update or optimize queries without changing frontend code.
- **Consistency:** Ensures that data fetching follows predefined patterns.
- **Abstraction:** Frontend developers only need to know the query identifier, not the underlying SQL complexity.

## Key Query Examples

*(This list is based on observed usage and may not be exhaustive. Always refer to `sql_query_locale.ts` for the ground truth.)*

The `sqlQueries` object in `src/lib/sql_query_locale.ts` contains mappings from identifiers (like `countUsers`) to the actual SQL strings.

Here are the likely purposes of some common queries observed in use:

- **`countUsers`**: Counts the total number of records in the `users` table.
- **`countWebstates`**: Counts the total number of unique webstates stored.
- **`countReplays`**: Counts the total number of replay sessions recorded.
- **`countEvents`**: Counts the total number of individual events across all replays.
- **`listRecentReplays`**: Retrieves a list of the most recent replay sessions (e.g., top 10), often including the `replay_id` and formatted `start_time`.
- **`listRecentWebstates`**: Retrieves a list of the most recently captured unique webstates, typically returning the `html_hash`.
- **`getLatestMonthlyReport`**: Fetches the full record for the most recently generated report from the `monthly_reports` table.
- **`getAllMonthlyReports`**: Retrieves all historical records from the `monthly_reports` table.

*Note: Review `src/lib/sql_query_locale.ts` for the complete and definitive list of available queries and their exact SQL definitions.*

## Adding New Queries

To add a new query:
1. Define the SQL query string.
2. Add a new descriptive key-value pair to the `sqlQueries` object in `src/lib/sql_query_locale.ts`.
3. Use the new key in frontend fetch requests to `/api/query_mysql`. 