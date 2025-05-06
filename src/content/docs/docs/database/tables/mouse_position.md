---
title: mouse_position Table
description: Records individual mouse coordinates for a mousemove event.
---

Stores the x, y coordinates and the target node ID for a specific point in time during a `mousemove_data` event sequence.

## Columns

| Column     | Type       | Modifiers                 |
|------------|------------|---------------------------|
| `event_id` | `CHAR(36)` | PK, FK(ref: mousemove_data)|
| `position_index` | `INT` | PK                       |
| `node_id`  | `INT`      | NOT NULL                  |
| `x`        | `INT`      | NOT NULL                  |
| `y`        | `INT`      | NOT NULL                  |
| `time_offset` | `INT`   | NOT NULL                  |

## Keys & Constraints

- **Primary Key:** (`event_id`, `position_index`)
- **Foreign Key:** `fk_mp_mmd` (`event_id`) -> `mousemove_data` (`event_id`)

## Referenced By

- (No tables reference this one directly) 