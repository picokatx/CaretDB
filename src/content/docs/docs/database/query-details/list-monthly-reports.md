---
title: listMonthlyReports Query
description: Retrieves all generated monthly summary reports.
---

This query fetches all records from the `monthly_reports` table, providing access to historical monthly summaries.

## SQL Query

```sql
SELECT 
  report_id, 
  report_month_start, 
  report_month_end,
  generated_at,
  new_users_count,
  new_webstates_count,
  new_replays_count,
  new_events_count,
  total_users_end,
  total_webstates_end,
  total_replays_end,
  total_events_end
FROM monthly_reports
ORDER BY report_month_start DESC;
```

## Purpose

To retrieve all calculated monthly summary reports stored in the database, ordered from the most recent month to the oldest.

## Parameters

This query does not accept any parameters (`?`).

## Results

The query returns rows representing each monthly report, with columns corresponding directly to the fields in the `monthly_reports` table:

| Column                | Type      | Description                                            |
|-----------------------|-----------|--------------------------------------------------------|
| `report_id`           | INT       | Unique identifier for the report.                      |
| `report_month_start`  | DATE      | The first day of the month the report covers.          |
| `report_month_end`    | DATE      | The last day of the month the report covers.           |
| `generated_at`        | TIMESTAMP | When the report generation process completed.          |
| `new_users_count`     | INT       | Number of new users created during the month.          |
| `new_webstates_count` | INT       | Number of new webstates created during the month.      |
| `new_replays_count`   | INT       | Number of new replays created during the month.        |
| `new_events_count`    | INT       | Number of new events recorded during the month.        |
| `total_users_end`     | INT       | Total number of users at the end of the month.         |
| `total_webstates_end` | INT       | Total number of webstates at the end of the month.     |
| `total_replays_end`   | INT       | Total number of replays at the end of the month.       |
| `total_events_end`    | INT       | Total number of events at the end of the month.        |

## Usage Context

-   **Reporting Page:** Directly used to populate the historical reports page (likely `src/pages/reports.astro`) where users can view past monthly summaries.
-   **API Endpoint:** Could be fetched via an API endpoint like `/api/reports`.

## Execution Notes

-   Selects all columns from the `monthly_reports` table.
-   Orders results by `report_month_start` descending.
-   Performance depends primarily on the number of rows in the `monthly_reports` table and the index on `report_month_start`. 