---
title: removed_node_mutation Table
description: Records nodes removed during a 'childlist' mutation.
---

Stores the `node_id` of a node that was removed from the DOM as part of a 'childlist' mutation event.

## Columns

| Column         | Type       | Modifiers              |
|----------------|------------|------------------------|
| `event_id`     | `CHAR(36)` | PK, FK(ref: mutation_data)|
| `node_id`      | `INT`      | PK                     |
| `parent_id`    | `INT`      | NOT NULL               |
| `next_sibling_id` | `INT`   |                        |

## Keys & Constraints

- **Primary Key:** (`event_id`, `node_id`)
- **Foreign Key:** `fk_rnm_md` (`event_id`) -> `mutation_data` (`event_id`)

## Referenced By

- (No tables reference this one directly) 