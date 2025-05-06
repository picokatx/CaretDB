---
title: event Table
description: Base table for all recorded events within a replay.
---

This table stores the common information for every event captured during a replay session, linking it to the session and recording its type and timing.

## Columns

| Column     | Type                                              | Modifiers                |
|------------|---------------------------------------------------|--------------------------|
| `event_id` | `CHAR(36)`                                        | PK                       |
| `replay_id`| `CHAR(36)`                                        | NOT NULL, FK(ref: replay)|
| `type`     | `ENUM('fullsnapshot','incrementalsnapshot','meta')`| NOT NULL                 |
| `timestamp`| `TIMESTAMP`                                       | NOT NULL                 |
| `delay`    | `INT`                                             |                          |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_event_replay` (`replay_id`) -> `replay` (`replay_id`)

## Referenced By

- `full_snapshot_event`
- `meta_event`
- `incremental_snapshot_event` 