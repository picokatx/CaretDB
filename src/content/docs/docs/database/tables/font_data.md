---
title: font_data Table
description: Captures details about fonts used or loaded on the page.
---

Records information about fonts encountered during the recording, often related to `@font-face` declarations.

## Schema Definition

(From `build_schema.sql`)

```sql
CREATE TABLE font_data (
  event_id    char(36)  primary key references incremental_snapshot_event(event_id),
  family      text not null,
  font_source text not null,
  buffer      boolean not null
);
```

## Columns

| Column      | Type       | Modifiers                                       |
|-------------|------------|-------------------------------------------------|
| `event_id`  | CHAR(36)   | PK, FK -> `incremental_snapshot_event(event_id)`|
| `family`    | TEXT       | NOT NULL. The font family name (e.g., 'Roboto'). |
| `font_source`| TEXT      | NOT NULL. The source URL or descriptor.         |
| `buffer`    | BOOLEAN    | NOT NULL. Indicates if font data was buffered (rrweb internal). |

## Keys & Constraints

-   **Primary Key:** (`event_id`) Identifies the font event.
-   **Foreign Key:** Implicit reference to `incremental_snapshot_event` via the primary key constraint.
    *   **Note:** It's highly recommended to add an explicit `ON DELETE CASCADE` foreign key constraint for data integrity.

## Referenced By

-   `font_descriptor` (`event_id`)

## Usage Context

-   Populated when an incremental snapshot event with type 'font' is recorded.
-   Provides the basic information about a loaded font.
-   Detailed CSS descriptors for the font are stored in the related `font_descriptor` table.

## Execution Notes

-   Stores font family and source information.
-   Linked to `font_descriptor` for specific CSS properties. 