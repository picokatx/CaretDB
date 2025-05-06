---
title: mouse_interaction_data Table
description: Details for various mouse interaction events.
---

Stores data for incremental snapshot events related to mouse actions like clicks, scrolls, and button presses.

## Columns

| Column     | Type                                                | Modifiers                             |
|------------|-----------------------------------------------------|---------------------------------------|
| `event_id` | `CHAR(36)`                                          | PK, FK(ref: incremental_snapshot_event)| 
| `type`     | `ENUM('mouseup','mousedown',...,'doubleclick')`       | NOT NULL                              |
| `button`   | `ENUM('left','middle','right','back','forward')`  | NOT NULL                              |
| `node_id`  | `INT`                                               | NOT NULL                              |
| `x`        | `INT`                                               | NOT NULL                              |
| `y`        | `INT`                                               | NOT NULL                              |

*Note: Full ENUM for `type` is ('mouseup','mousedown','click','contextmenu','dblclick','focus','blur','touchstart','touchend','touchcancel','touchmove') - though 'touchmove' might be better in `mousemove_data`.*

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_mid_ise` (`event_id`) -> `incremental_snapshot_event` (`event_id`)

## Referenced By

- (No tables reference this one directly) 