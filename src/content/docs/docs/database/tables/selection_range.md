---
title: selection_range Table
description: Defines a specific range within a user text selection.
---

Stores the start and end points (node and offset) for a single contiguous range within a `selection_data` event.

## Columns

| Column        | Type       | Modifiers                 |
|---------------|------------|---------------------------|
| `event_id`    | `CHAR(36)` | PK, FK(ref: selection_data)|
| `range_index` | `INT`      | PK                        |
| `start_node_id`| `INT`     | NOT NULL                  |
| `start_offset`| `INT`     | NOT NULL                  |
| `end_node_id`  | `INT`     | NOT NULL                  |
| `end_offset`  | `INT`     | NOT NULL                  |

## Keys & Constraints

- **Primary Key:** (`event_id`, `range_index`)
- **Foreign Key:** `fk_sr_seld` (`event_id`) -> `selection_data` (`event_id`)

## Referenced By

- (No tables reference this one directly) 