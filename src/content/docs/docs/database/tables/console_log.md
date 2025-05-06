---
title: console_log Table
description: Stores console messages recorded during a replay.
---

Captures console log messages (log, warn, error, etc.) that occurred during a recorded session.

## Columns

| Column     | Type                                  | Modifiers            |
|------------|---------------------------------------|----------------------|
| `log_id`   | `CHAR(36)`                            | PK                   |
| `replay_id`| `CHAR(36)`                            | NOT NULL, FK(ref: replay)|
| `level`    | `ENUM('log','warn','error','info','debug')`| NOT NULL             |
| `payload`  | `TEXT`                                | NOT NULL             |
| `trace`    | `TEXT`                                |                      |
| `timestamp`| `TIMESTAMP`                           | NOT NULL             |

## Keys & Constraints

- **Primary Key:** (`log_id`)
- **Foreign Key:** `fk_console_log_replay` (`replay_id`) -> `replay` (`replay_id`)

## Indexes

- `idx_console_log_timestamp` (`timestamp`)

## Referenced By

- (No tables reference this one directly) 