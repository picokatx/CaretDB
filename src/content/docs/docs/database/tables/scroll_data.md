---
title: scroll_data Table
description: Captures scroll position changes within an element.
---

Stores the scroll coordinates (x, y) for an element identified by `node_id` during an incremental snapshot event.

## Columns

| Column     | Type       | Modifiers                             |
|------------|------------|---------------------------------------|
| `event_id` | `CHAR(36)` | PK, FK(ref: incremental_snapshot_event)| 
| `node_id`  | `INT`      | NOT NULL                              |
| `x`        | `INT`      | NOT NULL                              |
| `y`        | `INT`      | NOT NULL                              |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_sd_ise` (`event_id`) -> `incremental_snapshot_event` (`event_id`)

## Referenced By

- (No tables reference this one directly) 