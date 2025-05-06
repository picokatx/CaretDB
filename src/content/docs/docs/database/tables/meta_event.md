---
title: meta_event Table
description: Stores metadata associated with a 'meta' type event.
---

Contains metadata captured during a recording, such as viewport size or URL, linked to a specific meta event.

## Columns

| Column        | Type       | Modifiers          |
|---------------|------------|--------------------|
| `event_id`    | `CHAR(36)` | PK, FK(ref: event) |
| `href`        | `TEXT`     |                    |
| `width`       | `INT`      |                    |
| `height`      | `INT`      |                    |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_me_event` (`event_id`) -> `event` (`event_id`)

## Referenced By

- (No tables reference this one directly) 