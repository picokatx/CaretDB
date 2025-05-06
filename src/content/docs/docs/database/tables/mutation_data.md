---
title: mutation_data Table
description: Details for 'mutation' source events, specifying the mutation type.
---

Links an incremental snapshot event of source 'mutation' to the specific type of DOM mutation that occurred.

## Columns

| Column     | Type                                       | Modifiers                             |
|------------|--------------------------------------------|---------------------------------------|
| `event_id` | `CHAR(36)`                                 | PK, FK(ref: incremental_snapshot_event)| 
| `type`     | `ENUM('text', 'attributes', 'childlist')` | NOT NULL                              |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_md_ise` (`event_id`) -> `incremental_snapshot_event` (`event_id`)

## Referenced By

- `text_mutation`
- `attribute_mutation`
- `removed_node_mutation`
- `added_node_mutation` 