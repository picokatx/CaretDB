---
title: font_descriptor Table
description: Stores key-value descriptors for a font.
---

Contains CSS font descriptors (like `style`, `weight`, `unicode-range`) associated with a specific `font_data` event.

## Columns

| Column     | Type          | Modifiers            |
|------------|---------------|----------------------|
| `event_id` | `CHAR(36)`    | PK, FK(ref: font_data)|
| `key`      | `VARCHAR(64)` | PK                   |
| `value`    | `TEXT`        |                      |

## Keys & Constraints

- **Primary Key:** (`event_id`, `key`)
- **Foreign Key:** `fk_fdesc_fd` (`event_id`) -> `font_data` (`event_id`)

## Referenced By

- (No tables reference this one directly) 