---
title: clickEventsOverTime Query
description: Calculates the total number of click events per day across all replays.
---

This query aggregates click event data to show the trend of user clicks over time.

## SQL Query

```sql
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
```

## Purpose

To retrieve a time series dataset representing the total number of recorded click interactions aggregated by date across all replays stored in the database.

## Parameters

This query does not accept any parameters (`?`).

## Results

The query returns rows with the following columns:

| Column | Type   | Description                                    |
|--------|--------|------------------------------------------------|
| `date` | DATE   | The calendar date on which the clicks occurred.|
| `count`| BIGINT | The total number of click events on that date. |

## Usage Context

-   **Dashboard/Analytics:** Likely used by an API endpoint that feeds data to a chart or graph on the dashboard or an analytics page, visualizing the daily click activity across the platform.
-   **Backend API:** Could be part of an internal analytics API endpoint (e.g., `/api/analytics/clicks-daily`).

## Execution Notes

-   Joins `event`, `incremental_snapshot_event`, and `mouse_interaction_data` tables.
-   Filters for events that are specifically `'mouseinteraction'` of type `'click'`.
-   Groups results by date and orders chronologically.
-   Performance depends on the size of the event-related tables and the presence of appropriate indexes (especially on `e.timestamp`, `ise.event_id`, `mid.event_id`, `ise.t`, `mid.interaction_type`). 