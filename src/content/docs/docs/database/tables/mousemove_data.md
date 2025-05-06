---
title: mousemove_data Table
description: Stores sequences of mouse positions for 'mousemove' events.
---

Contains the details for incremental snapshot events where the source is 'mousemove'. Each event can contain multiple recorded mouse positions.

## Columns

| Column     | Type       | Modifiers                             |
|------------|------------|---------------------------------------|
| `event_id` | `CHAR(36)` | PK, FK(ref: incremental_snapshot_event)| 
| `source`   | `ENUM('mousemove','touchmove')`       | NOT NULL                              |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_mmd_ise` (`event_id`) -> `incremental_snapshot_event` (`event_id`)

## Referenced By

- `mouse_position` 