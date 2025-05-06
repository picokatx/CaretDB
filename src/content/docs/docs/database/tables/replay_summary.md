---
title: replay_summary Table
description: Stores aggregated summary data for replays.
---

Contains pre-calculated summary information about a replay, potentially for faster retrieval or reporting.

## Columns

| Column               | Type         | Modifiers                      |
|----------------------|--------------|--------------------------------|
| `replay_id`          | `CHAR(36)`   | PK, FK(ref: replay)            |
| `html_hash`          | `CHAR(64)`   | NOT NULL, FK(ref: webstate)    |
| `duration`           | `INT`        | NOT NULL, CHECK(> 0)           |
| `event_count`        | `INT`        | NOT NULL, CHECK(>= 0)          |
| `mutation_count`     | `INT`        | NOT NULL, CHECK(>= 0)          |
| `mouse_event_count`  | `INT`        | NOT NULL, CHECK(>= 0)          |
| `scroll_event_count` | `INT`        | NOT NULL, CHECK(>= 0)          |
| `input_event_count`  | `INT`        | NOT NULL, CHECK(>= 0)          |
| `console_log_count`  | `INT`        | NOT NULL, CHECK(>= 0)          |
| `network_request_count`| `INT`      | NOT NULL, CHECK(>= 0)          |
| `error_count`        | `INT`        | NOT NULL, CHECK(>= 0)          |
| `first_input_delay`  | `INT`        |                                |
| `largest_contentful_paint`| `INT`   |                                |
| `cumulative_layout_shift`| `DECIMAL(10, 5)` |                       |
| `processing_status`  | `ENUM(...)`  | NOT NULL, DEFAULT('pending')   |
| `created_at`         | `TIMESTAMP`  | NOT NULL, DEFAULT(CURRENT_TIMESTAMP) |
| `updated_at`         | `TIMESTAMP`  | NOT NULL, DEFAULT(CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP |

*Note: Full ENUM for `processing_status` is ('pending', 'processing', 'completed', 'failed')*

## Keys & Constraints

- **Primary Key:** (`replay_id`)
- **Foreign Key:** `fk_replay_summary_replay` (`replay_id`) -> `replay` (`replay_id`)
- **Foreign Key:** `fk_replay_summary_webstate` (`html_hash`) -> `webstate` (`html_hash`)

## Referenced By

- (No tables reference this one directly) 