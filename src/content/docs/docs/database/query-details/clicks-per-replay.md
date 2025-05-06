---
title: clicksPerReplay Query
description: Retrieves the total click count for each replay session.
---

This query fetches the pre-calculated click count for every replay, ordered by start time.

## SQL Query

```sql
SELECT
    r.replay_id,
    DATE_FORMAT(r.start_time, '%Y-%m-%d %H:%i:%s') as start_time_formatted,
    rs.click_count
FROM
    replay r
JOIN
    replay_summary rs ON r.replay_id = rs.replay_id
ORDER BY
    r.start_time ASC;
```

## Purpose

To get a list of all replays along with their start times and the total number of click events recorded within each replay session, leveraging the pre-aggregated data in the `replay_summary` table.

## Parameters

This query does not accept any parameters (`?`).

## Results

The query returns rows with the following columns:

| Column               | Type    | Description                                      |
|----------------------|---------|--------------------------------------------------|
| `replay_id`          | CHAR(36)| The unique identifier for the replay session.    |
| `start_time_formatted`| VARCHAR | The start time of the replay, formatted nicely.  |
| `click_count`        | INT     | The total number of clicks in that replay session.|

## Usage Context

-   **Analytics/Reporting:** Useful for displaying a table or list showing which replays had the most (or least) click activity.
-   **API Endpoint:** Could be used by an endpoint like `/api/analytics/replay-click-counts`.

## Execution Notes

-   Relies on the `replay_summary` table being populated correctly (likely by a separate process or trigger).
-   Joins `replay` and `replay_summary` tables.
-   Orders the results by the replay start time.
-   Performance depends on the size of the `replay` and `replay_summary` tables and indexing on `r.replay_id`, `rs.replay_id`, and `r.start_time`. 