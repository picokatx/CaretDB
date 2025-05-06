---
title: replay Table
description: Stores metadata about a user recording session.
---

Contains high-level information about each recorded session, including timing, environment details, and a link to the initial webstate.

## Columns

| Column            | Type           | Modifiers                               |
|-------------------|----------------|-----------------------------------------|
| `replay_id`       | `CHAR(36)`     | PK                                      |
| `html_hash`       | `CHAR(64)`     | NOT NULL, FK(ref: webstate)             |
| `start_time`      | `TIMESTAMP`    | NOT NULL                                |
| `end_time`        | `TIMESTAMP`    | NOT NULL, CHECK(start <= end)           |
| `product`         | `VARCHAR(24)`  | CHECK(enum)                             |
| `product_version` | `VARCHAR(24)`  | CHECK(regexp)                           |
| `comment`         | `VARCHAR(255)` |                                         |
| `device_type`     | `VARCHAR(24)`  | CHECK(enum)                             |
| `os_type`         | `VARCHAR(24)`  | CHECK(enum)                             |
| `os_version`      | `VARCHAR(16)`  | CHECK(regexp)                           |
| `network_id`      | `VARCHAR(15)`  | CHECK(regexp)                           |
| `host_id`         | `VARCHAR(4096)`| CHECK(regexp)                           |
| `d_viewport_height`| `INT`         | CHECK(> 0)                              |
| `d_viewport_width` | `INT`         | CHECK(> 0)                              |

## Keys & Constraints

- **Primary Key:** (`replay_id`)
- **Foreign Key:** `fk_replay_webstate` (`html_hash`) -> `webstate` (`html_hash`)
- **Check:** `correct_times` (`start_time <= end_time`)
- **Check:** `chk_viewport_height` (`d_viewport_height > 0`)
- **Check:** `chk_viewport_width` (`d_viewport_width > 0`)

## Referenced By

- `event` (`fk_event_replay`)
- `console_log` (`fk_console_log_replay`)
- `network_request` (`fk_network_request_replay`)
- `replay_summary` (`fk_replay_summary_replay`) 