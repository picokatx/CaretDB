---
title: selection_data Table
description: Base table for user text selection events.
---

Represents an event where the user selected text on the page. The actual selected ranges are stored in `selection_range`.

## Schema Definition

(From `build_schema.sql`)

```sql
CREATE TABLE selection_data (
  event_id char(36) primary key references incremental_snapshot_event(event_id)
);
```

## Columns

| Column     | Type       | Modifiers                                       |
|------------|------------|-------------------------------------------------|
| `event_id` | CHAR(36)   | PK, FK -> `incremental_snapshot_event(event_id)`|

## Keys & Constraints

-   **Primary Key:** (`event_id`) Identifies the selection event.
-   **Foreign Key:** Implicit reference to `incremental_snapshot_event` via the primary key constraint.
    *   **Note:** It's highly recommended to add an explicit `ON DELETE CASCADE` foreign key constraint to ensure data integrity when the parent `incremental_snapshot_event` is deleted.

## Referenced By

-   `selection_range` (`event_id`)

## Usage Context

-   Populated when an incremental snapshot event with type 'selection' is recorded.
-   Serves as the parent record for one or more `selection_range` entries that define the specific selected areas.

## Execution Notes

-   This table primarily acts as a link between the base incremental event and the detailed selection ranges.
-   It does not store selection details itself. 