---
title: serialized_node_child Table
description: Defines the parent-child relationships between nodes in a DOM snapshot.
---

This table establishes the hierarchical structure of the captured DOM by linking parent nodes to their children.

## Columns

| Column     | Type  | Modifiers                           |
|------------|-------|-------------------------------------|
| `parent_id`| `INT` | PK, FK(ref: serialized_node)        |
| `child_id` | `INT` | PK, FK(ref: serialized_node), UK(ref) |

## Keys & Constraints

- **Primary Key:** (`parent_id`, `child_id`)
- **Foreign Key:** `fk_snc_parent` (`parent_id`) -> `serialized_node` (`id`)
- **Foreign Key:** `fk_snc_child` (`child_id`) -> `serialized_node` (`id`)
- **Unique Key:** `uk_snc_child_id` (`child_id`) 