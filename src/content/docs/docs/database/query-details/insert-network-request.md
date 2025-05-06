---
title: insertNetworkRequest Query
description: Inserts a record of a network request event.
---

This query saves the details of a network request captured during a replay session.

## SQL Query

```sql
INSERT INTO network_request (
  request_log_id, replay_id, request_session_id, url, method, status_code, 
  status_text, request_type, initiator_type, start_time_offset, 
  end_time_offset, duration_ms, absolute_timestamp, request_headers, 
  response_headers, response_size_bytes, performance_data, 
  is_fetch_complete, is_perf_complete
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
```

## Purpose

To insert a complete record of a network request (like XHR, fetch, resource loading) into the `network_request` table, associating it with the corresponding replay session.

## Parameters

This query expects 19 parameters (`?`) corresponding to the columns:

1.  `request_log_id`: (CHAR(36)) Unique ID for this log entry.
2.  `replay_id`: (CHAR(36)) ID of the replay session this request belongs to.
3.  `request_session_id`: (VARCHAR - check length) An identifier linking parts of the same request (e.g., request start, response end).
4.  `url`: (TEXT) The URL of the request.
5.  `method`: (VARCHAR(8)) HTTP method (e.g., 'GET', 'POST').
6.  `status_code`: (INT, Nullable) HTTP status code of the response (e.g., 200, 404).
7.  `status_text`: (TEXT, Nullable) Status text of the response (e.g., 'OK', 'Not Found').
8.  `request_type`: (VARCHAR - check length) Type of request (e.g., 'fetch', 'xmlhttprequest', 'script').
9.  `initiator_type`: (VARCHAR(16), Nullable) What triggered the request (e.g., 'script', 'img').
10. `start_time_offset`: (INT) Timestamp offset from the start of the replay when the request began.
11. `end_time_offset`: (INT, Nullable) Timestamp offset when the request ended.
12. `duration_ms`: (INT, Nullable) Duration of the request in milliseconds.
13. `absolute_timestamp`: (TIMESTAMP) The absolute server time when the request event was recorded.
14. `request_headers`: (TEXT, Nullable) Request headers (likely stored as JSON string).
15. `response_headers`: (TEXT, Nullable) Response headers (likely stored as JSON string).
16. `response_size_bytes`: (INT, Nullable) Size of the response body.
17. `performance_data`: (TEXT, Nullable) Performance timing details (e.g., from Performance API, stored as JSON string).
18. `is_fetch_complete`: (BOOLEAN) Flag indicating if the fetch/XHR response part is complete.
19. `is_perf_complete`: (BOOLEAN) Flag indicating if the performance data part is complete.

## Usage Context

-   **Save Replay Process:** Called within the `/api/save-replay` endpoint or related logic whenever a network request event is received from the `rrweb` recording.

## Execution Notes

-   Inserts a single row into `network_request`.
-   Handles potentially large text fields for headers and bodies (ensure database column types are sufficient, e.g., TEXT or MEDIUMTEXT).
-   Some fields are nullable, depending on whether the request/response cycle is fully captured at the time of logging.
-   Performance could be impacted by frequent inserts if network activity is very high; consider bulk inserts if necessary. 