---
title: clickEventsPerSecond Query
description: Calculates the total number of click events per second across all replays.
---

This query provides a granular view of click activity, aggregated by the second.

## SQL Query

```sql
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
```

## Purpose

To retrieve a high-resolution time series dataset showing the total number of click interactions aggregated precisely by the second they occurred across all replays.

## Parameters

This query does not accept any parameters (`?`).

## Results

The query returns rows with the following columns:

| Column  | Type      | Description                                                     |
|---------|-----------|-----------------------------------------------------------------|
| `second`| VARCHAR   | The specific second (YYYY-MM-DD HH:MM:SS) when clicks occurred. |
| `count` | BIGINT    | The total number of click events that occurred in that second.  |

## Usage Context

-   **Detailed Analytics:** Could be used for detailed analysis of click patterns, identifying bursts of activity or correlating clicks with specific time-sensitive events.
-   **API Endpoint:** Might feed an API endpoint for specialized analytics visualizations that require per-second granularity (e.g., `/api/analytics/clicks-per-second`).

## Execution Notes

-   Similar joins and filters to `clickEventsOverTime`.
-   Uses `DATE_FORMAT` to group by the exact second, which can result in a larger result set compared to daily aggregation.
-   Performance is sensitive to table sizes and indexing, potentially more so than the daily query due to the finer grouping granularity. 