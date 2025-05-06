---
title: attribute_mutation Table
description: Base table for attribute changes on a node.
---

Links an 'attributes' type mutation event to the affected node. The actual attribute changes are stored in `attribute_mutation_entry`.

## Columns

| Column     | Type       | Modifiers              |
|------------|------------|------------------------|
| `event_id` | `CHAR(36)` | PK, FK(ref: mutation_data)|
| `node_id`  | `INT`      | NOT NULL               |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_am_md` (`event_id`) -> `mutation_data` (`event_id`)

## Referenced By

- `attribute_mutation_entry` 