---
title: viewport_resize_data Table
description: Records changes in the browser viewport dimensions.
---

Stores the new width and height of the viewport when a resize event occurs during a recording session.

## Columns

| Column     | Type       | Modifiers                             |
|------------|------------|---------------------------------------|
| `event_id` | `CHAR(36)` | PK, FK(ref: incremental_snapshot_event)| 
| `width`    | `INT`      | NOT NULL                              |
| `height`   | `INT`      | NOT NULL                              |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_vrd_ise` (`event_id`) -> `incremental_snapshot_event` (`event_id`)

## Referenced By

- (No tables reference this one directly) 