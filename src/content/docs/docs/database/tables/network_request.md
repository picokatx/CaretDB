---
title: network_request Table
description: Records network requests made during a replay session.
---

Stores detailed information about network requests (e.g., fetch, XHR, resource loading) initiated by the browser during a recorded session.

## Schema Definition

(From `build_schema.sql`)

```sql
CREATE TABLE network_request (
    request_log_id char(36) primary key,        -- Unique ID for this specific log entry
    replay_id char(36) not null,                -- Foreign key to the replay session
    request_session_id varchar(64) not null,   -- The unique ID from the network plugin (e.g., fetch-174...) 
    url text not null,                          -- The request URL
    method varchar(16) not null,                -- GET, POST, etc.
    status_code smallint unsigned null,         -- HTTP status code (e.g., 200, 404)
    status_text varchar(255) null,              -- HTTP status text (e.g., OK, Not Found)
    request_type varchar(32) null,              -- Type from the log (e.g., fetch, xhr)
    initiator_type varchar(32) null,           -- Initiator type (e.g., fetch, script)
    start_time_offset int unsigned not null,    -- Start time relative to recording start (ms)
    end_time_offset int unsigned null,          -- End time relative to recording start (ms)
    duration_ms int unsigned null,              -- Request duration (ms)
    absolute_timestamp timestamp not null,      -- Absolute timestamp of the request end/log point
    request_headers json null,                  -- Request headers as JSON
    response_headers json null,                 -- Response headers as JSON
    response_size_bytes int unsigned null,      -- Size of the response body
    performance_data json null,                 -- Performance timing data as JSON
    is_fetch_complete boolean null,             -- Flag from log data
    is_perf_complete boolean null,              -- Flag from log data
    constraint fk_network_request_replay foreign key (replay_id) references replay(replay_id) on delete cascade
);
CREATE INDEX idx_network_request_replay_id on network_request(replay_id);
```

## Columns

| Column               | Type                | Modifiers/Description                                      |
|----------------------|---------------------|------------------------------------------------------------|
| `request_log_id`     | CHAR(36)            | PK. Unique ID for this log entry.                          |
| `replay_id`          | CHAR(36)            | NOT NULL, FK -> `replay(replay_id)` ON DELETE CASCADE.     |
| `request_session_id` | VARCHAR(64)         | NOT NULL. ID linking request phases (e.g., `fetch-123`).   |
| `url`                | TEXT                | NOT NULL. The request URL.                                 |
| `method`             | VARCHAR(16)         | NOT NULL. HTTP method (GET, POST, etc.).                   |
| `status_code`        | SMALLINT UNSIGNED   | Nullable. HTTP status code (200, 404, etc.).               |
| `status_text`        | VARCHAR(255)        | Nullable. HTTP status text (OK, Not Found, etc.).          |
| `request_type`       | VARCHAR(32)         | Nullable. Type like 'fetch', 'xhr', 'script'.             |
| `initiator_type`     | VARCHAR(32)         | Nullable. How request was initiated ('fetch', 'script'). |
| `start_time_offset`  | INT UNSIGNED        | NOT NULL. Start time relative to replay start (ms).        |
| `end_time_offset`    | INT UNSIGNED        | Nullable. End time relative to replay start (ms).          |
| `duration_ms`        | INT UNSIGNED        | Nullable. Duration of the request (ms).                    |
| `absolute_timestamp` | TIMESTAMP           | NOT NULL. Timestamp when log entry was created.            |
| `request_headers`    | JSON                | Nullable. Request headers.                                 |
| `response_headers`   | JSON                | Nullable. Response headers.                                |
| `response_size_bytes`| INT UNSIGNED        | Nullable. Size of the response body.                       |
| `performance_data`   | JSON                | Nullable. Performance timing details.                      |
| `is_fetch_complete`  | BOOLEAN             | Nullable. Flag indicating response body received.          |
| `is_perf_complete`   | BOOLEAN             | Nullable. Flag indicating performance data received.       |

## Keys & Constraints

-   **Primary Key:** (`request_log_id`)
-   **Foreign Key:** `fk_network_request_replay` (`replay_id`) references `replay` (`replay_id`) with `ON DELETE CASCADE`.

## Indexes

-   `idx_network_request_replay_id` on (`replay_id`): Speeds up queries filtering by replay.

## Referenced By

-   (No other tables reference `network_request`)

## Usage Context

-   Populated by the backend (e.g., `/api/save-replay`) when processing network request events captured by the recording script.
-   Used to display network activity details alongside session replays.

## Execution Notes

-   Stores comprehensive details about each network request.
-   Uses JSON columns for headers and performance data, requiring MySQL 5.7.8+.
-   The `ON DELETE CASCADE` ensures network logs are cleaned up when a replay is deleted. 