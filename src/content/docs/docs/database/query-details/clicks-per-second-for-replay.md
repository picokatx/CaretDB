---
title: clicksPerSecondForReplay Query
description: Calculates click events per second for a specific replay session.
---

This query aggregates click events by the second for a single, specified replay.

## SQL Query

```sql
SELECT 
    DATE_FORMAT(e.timestamp, '%Y-%m-%d %H:%i:%s') as second, 
    COUNT(e.event_id) as count 
FROM event e
JOIN incremental_snapshot_event ise ON e.event_id = ise.event_id
JOIN mouse_interaction_data mid ON ise.event_id = mid.event_id
WHERE 
    e.replay_id = ? 
    AND ise.t = 'mouseinteraction' 
    AND mid.interaction_type = 'click'
GROUP BY second
ORDER BY second ASC;
```

## Purpose

To retrieve a time series dataset showing the number of click interactions per second within a specific replay session.

## Parameters

| Parameter | Type     | Description                         |
|-----------|----------|-------------------------------------|
| `?` (1st) | CHAR(36) | The `replay_id` of the target replay. |

## Results

The query returns rows with the following columns:

| Column  | Type    | Description                                                     |
|---------|---------|-----------------------------------------------------------------|
| `second`| VARCHAR | The specific second (YYYY-MM-DD HH:MM:SS) when clicks occurred. |
| `count` | BIGINT  | The number of click events that occurred in that second.        |

## Usage Context

-   **Replay Analysis:** Used to visualize click activity over time within a specific replay, perhaps on a timeline chart displayed alongside the replay viewer.
-   **API Endpoint:** Likely used by an API endpoint that takes a `replay_id` as input, such as `/api/replays/:replayId/clicks-per-second`.

## Execution Notes

-   Similar joins and filters to `clickEventsPerSecond`, but adds a `WHERE e.replay_id = ?` clause.
-   Grouping by second provides high granularity for analyzing a single replay's click patterns.
-   Performance depends on the number of events in the specified replay and indexing on `e.replay_id`, `e.timestamp`, event join keys, `ise.t`, and `mid.interaction_type`. 