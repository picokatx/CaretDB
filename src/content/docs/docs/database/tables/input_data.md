---
title: input_data Table
description: Captures changes to input element values.
---

Stores information about user input into form elements, including the target element (`node_id`), the new value, and whether the input represents a checked state change.

## Columns

| Column      | Type       | Modifiers                             |
|-------------|------------|---------------------------------------|
| `event_id`  | `CHAR(36)` | PK, FK(ref: incremental_snapshot_event)| 
| `node_id`   | `INT`      | NOT NULL                              |
| `value`     | `TEXT`     |                                       |
| `is_checked`| `BOOLEAN`  | NOT NULL, DEFAULT: false              |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_id_ise` (`event_id`) -> `incremental_snapshot_event` (`event_id`)

## Referenced By

- (No tables reference this one directly) 