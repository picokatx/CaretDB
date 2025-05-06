---
title: incremental_snapshot_event Table
description: Base table linking events to specific incremental change types.
---

This table acts as a bridge, linking a base `event` record (specifically one with `type='incrementalsnapshot'`) to the table containing the detailed data for that specific type of incremental change (e.g., mutation, mouse move, input).

## Schema Definition

(From `build_schema.sql`)

```sql
CREATE TABLE incremental_snapshot_event (
  event_id            char(36) primary key references event(event_id),
  t  enum (  -- renamed from source and moved here
    'mutation','mousemove','mouseinteraction','scroll','viewportresize',
    'input','touchmove','mediainteraction','stylesheetrule',
    'canvasmutation','font','log','drag','styledeclaration','selection',
    'adoptedstylesheet','customelement'
    )  not null
);
```

## Columns

| Column     | Type       | Modifiers                         |
|------------|------------|-----------------------------------| 
| `event_id` | CHAR(36)   | PK, FK -> `event(event_id)`       |
| `t`        | ENUM(...)  | NOT NULL. The type of incremental snapshot. See ENUM definition above. |

## Keys & Constraints

-   **Primary Key:** (`event_id`) Identifies the specific incremental event.
-   **Foreign Key:** Implicit reference to `event` (`event_id`) via the primary key constraint.
    *   **Note:** It's highly recommended to add an explicit `ON DELETE CASCADE` foreign key constraint. When the base `event` is deleted (e.g., cascading from a `replay` deletion), this record should also be deleted.

## Referenced By

This table is referenced by numerous tables containing the detailed data for each incremental type (`t`):

-   `mutation_data` (`event_id`)
-   `mousemove_data` (`event_id`)
-   `mouse_interaction_data` (`event_id`)
-   `scroll_data` (`event_id`)
-   `viewport_resize_data` (`event_id`)
-   `input_data` (`event_id`)
-   `media_interaction_data` (`event_id`)
-   `font_data` (`event_id`)
-   `selection_data` (`event_id`)
-   *(Others based on the full ENUM: `stylesheetrule`, `canvasmutation`, `drag`, `styledeclaration`, `adoptedstylesheet`, `customelement` - if corresponding detail tables exist)*

## Usage Context

-   Populated for every event recorded by `rrweb` that isn't a full snapshot or meta event.
-   The `t` column is crucial for determining which specific detail table (e.g., `mutation_data`, `scroll_data`) contains the actual data for this `event_id`.

## Execution Notes

-   Acts as a discriminator table for different types of incremental events.
-   Joins are required between `event`, `incremental_snapshot_event`, and the specific detail table (e.g., `mutation_data`) to get the full context of an incremental change. 