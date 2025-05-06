---
title: text_mutation Table
description: Details for text content changes within a node.
---

Stores the specific data for a 'text' type mutation event, linking to the affected node and its new text value.

## Columns

| Column     | Type       | Modifiers              |
|------------|------------|------------------------|
| `event_id` | `CHAR(36)` | PK, FK(ref: mutation_data)|
| `node_id`  | `INT`      | NOT NULL               |
| `value`    | `TEXT`     |                        |

## Keys & Constraints

- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_tm_md` (`event_id`) -> `mutation_data` (`event_id`)

## Referenced By

- (No tables reference this one directly) 