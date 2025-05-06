---
title: serialized_node_attribute Table
description: Stores HTML attributes associated with serialized element nodes.
---

This table holds the key-value pairs of attributes for nodes identified as elements within the `serialized_node` table.

## Columns

| Column   | Type          | Modifiers                   |
|----------|---------------|-----------------------------|
| `node_id`| `INT`         | PK, FK(ref: serialized_node)|
| `key`    | `VARCHAR(64)` | PK                          |
| `value`  | `TEXT`        |                             |

## Keys & Constraints

- **Primary Key:** (`node_id`, `key`)
- **Foreign Key:** `fk_sna_node` (`node_id`) -> `serialized_node` (`id`)

## Referenced By

- (No tables reference this one directly) 