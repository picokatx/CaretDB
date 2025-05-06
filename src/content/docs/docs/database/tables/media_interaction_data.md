---
title: media_interaction_data Table
description: Records interactions with media elements (e.g., play, pause).
---

Stores details about user interactions with media elements (like `<video>` or `<audio>`), such as play/pause actions and the time within the media.

## Columns

| Column      | Type                       | Modifiers                             |
|-------------|----------------------------|---------------------------------------|
| `event_id`  | `CHAR(36)`                 | PK, FK(ref: incremental_snapshot_event)| 
| `node_id`   | `INT`                      | NOT NULL                              |
| `type`      | `ENUM('play', 'pause')`   | NOT NULL                              |
| `current_time` | `INT`                 |                                       |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_midata_ise` (`event_id`) -> `incremental_snapshot_event` (`event_id`)

## Referenced By

- (No tables reference this one directly) 