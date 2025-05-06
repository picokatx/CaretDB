---
title: full_snapshot_event Table
description: Details of a 'fullsnapshot' type event, linking to the captured DOM root.
---

This table holds the specific data for a full DOM snapshot event, referencing the root node of the captured DOM structure stored in `serialized_node`.

## Columns

| Column     | Type       | Modifiers           |
|------------|------------|---------------------|
| `event_id` | `CHAR(36)` | PK, FK(ref: event)  |
| `node_id`  | `INT`      | FK(ref: serialized_node)|

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_fse_event` (`event_id`) -> `event` (`event_id`)
- **Foreign Key:** `fk_fse_node` (`node_id`) -> `serialized_node` (`id`)

## Referenced By

- (No tables reference this one directly) 