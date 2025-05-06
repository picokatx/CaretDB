---
title: serialized_node Table
description: Represents nodes (elements, text, etc.) within a captured DOM snapshot.
---

This table stores the representation of individual nodes captured as part of a full DOM snapshot.

## Columns

| Column         | Type                                              | Modifiers                 |
|----------------|---------------------------------------------------|---------------------------|
| `id`           | `INT`                                             | PK                        |
| `type`         | `ENUM('doc...','comment')`                         | NOT NULL                  |
| `root_id`      | `INT`                                             |                           |
| `is_shadow_host`| `BOOLEAN`                                         | NOT NULL, DEFAULT: false  |
| `is_shadow`    | `BOOLEAN`                                         | NOT NULL, DEFAULT: false  |
| `compat_mode`  | `TEXT`                                            | (Document-specific)       |
| `name`         | `TEXT`                                            | (DocumentType-specific)   |
| `public_id`    | `TEXT`                                            | (DocumentType-specific)   |
| `system_id`    | `TEXT`                                            | (DocumentType-specific)   |
| `tag`          | `VARCHAR(24)`                                     | (Element-specific)        |
| `is_svg`       | `BOOLEAN`                                         | NOT NULL, DEFAULT: false  |
| `need_block`   | `BOOLEAN`                                         | NOT NULL, DEFAULT: false  |
| `is_custom`    | `BOOLEAN`                                         | NOT NULL, DEFAULT: false  |
| `text_content` | `TEXT`                                            | (Text/Comment/CDATA)      |

*Note: The full ENUM for `type` is ('document','documenttype','element','text','cdata','comment').* 

## Keys & Constraints

- **Primary Key:** (`id`)

## Referenced By

- `serialized_node_child` (as `parent_id` and `child_id`)
- `serialized_node_attribute` (`node_id`)
- `full_snapshot_event` (`node_id`)
- `added_node_mutation` (`node_id`) 