---
title: style_om_value_entry Table
description: Stores individual property-value pairs for a CSS Style OM value.
---

Contains the actual CSS property and value strings associated with a `style_om_value` record.

## Columns

| Column      | Type          | Modifiers                   |
|-------------|---------------|-----------------------------|
| `om_value_id`| `CHAR(36)`    | PK, FK(ref: style_om_value) |
| `key`       | `VARCHAR(128)`| PK                          |
| `value`     | `TEXT`        | NOT NULL                    |

## Keys & Constraints

- **Primary Key:** (`om_value_id`, `key`)
- **Foreign Key:** `fk_sove_sov` (`om_value_id`) -> `style_om_value` (`om_value_id`)

## Referenced By

- (No tables reference this one directly) 