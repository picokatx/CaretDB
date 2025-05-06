---
title: style_om_value Table
description: Represents a CSS Style Object Model (OM) value, often linked to computed styles.
---

Stores a reference to a specific CSS OM value, likely part of computed style information captured during an incremental snapshot.

## Columns

| Column      | Type       | Modifiers                         |
|-------------|------------|-----------------------------------|
| `om_value_id`| `CHAR(36)` | PK                                |
| `event_id`  | `CHAR(36)` | NOT NULL, FK(ref: ...)            |
| `node_id`   | `INT`      | NOT NULL                          |

*Note: The specific event table (`style_declaration_data` or `style_sheet_rule_data`) that references this via `event_id` needs confirmation from the schema definition.*

## Keys & Constraints

- **Primary Key:** (`om_value_id`)
- **Foreign Key:** `fk_sov_event` (`event_id`) -> (Needs confirmation: `style_declaration_data` or `style_sheet_rule_data`?)

## Referenced By

- `style_om_value_entry` 