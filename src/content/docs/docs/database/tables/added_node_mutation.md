---
title: added_node_mutation Table
description: Records nodes added during a 'childlist' mutation.
---

Stores details about a node added to the DOM during a 'childlist' mutation, including its ID, parent, and sibling.

## Columns

| Column         | Type       | Modifiers                   |
|----------------|------------|-----------------------------|
| `event_id`     | `CHAR(36)` | PK, FK(ref: mutation_data)  |
| `node_id`      | `INT`      | PK, FK(ref: serialized_node)|
| `parent_id`    | `INT`      | NOT NULL                    |
| `next_sibling_id`| `INT`     |                             |

## Keys & Constraints

- **Primary Key:** (`event_id`, `node_id`)
- **Foreign Key:** `fk_anm_md` (`event_id`) -> `mutation_data` (`event_id`)
- **Foreign Key:** `fk_anm_node` (`node_id`) -> `serialized_node` (`id`)

## Referenced By

- (No tables reference this one directly) 