---
title: eventsPerSecondForReplay Query
description: Calculates the total number of incremental events per second for a specific replay.
---

This query aggregates all incremental snapshot events by the second for a single, specified replay.

## SQL Query

```sql
SELECT 
    DATE_FORMAT(e.timestamp, '%Y-%m-%d %H:%i:%s') as second, 
    COUNT(e.event_id) as count 
FROM event e
JOIN incremental_snapshot_event ise ON e.event_id = ise.event_id
WHERE 
    e.replay_id = ? 
GROUP BY second
ORDER BY second ASC;
```

## Purpose

To retrieve a time series dataset showing the total count of *all* types of incremental snapshot events (mutations, mouse movements, scrolls, inputs, etc.) per second within a specific replay session.

## Parameters

| Parameter | Type     | Description                         |
|-----------|----------|-------------------------------------|
| `?` (1st) | CHAR(36) | The `replay_id` of the target replay. |

## Results

The query returns rows with the following columns:

| Column  | Type    | Description                                                                  |
|---------|---------|------------------------------------------------------------------------------|
| `second`| VARCHAR | The specific second (YYYY-MM-DD HH:MM:SS) when incremental events occurred.|
| `count` | BIGINT  | The total number of incremental events that occurred in that second.         |

## Usage Context

-   **Replay Analysis:** Useful for visualizing the overall activity level or "density" of events over time within a specific replay. Can help identify periods of high user interaction or significant DOM changes.
-   **API Endpoint:** Could be used by an API endpoint like `/api/replays/:replayId/events-per-second` to provide data for a replay timeline or activity graph.

## Execution Notes

-   Joins `event` and `incremental_snapshot_event` tables.
-   Filters by the specified `replay_id`.
-   Groups by the exact second using `DATE_FORMAT`.
-   Performance depends on the total number of incremental events in the replay and indexing on `e.replay_id`, `e.timestamp`, and `ise.event_id`. 