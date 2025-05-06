---
title: attribute_mutation_entry Table
description: Stores individual attribute changes for an attribute mutation event.
---

This table contains the actual key-value pairs of attributes that were modified on a specific node during an `attribute_mutation` event.

## Schema Definition

(From `build_schema.sql`)

```sql
CREATE TABLE attribute_mutation_entry (
  event_id         char(36)    not null,
  node_id          int    not null,
  attribute_key    char(32)   not null,
  string_value     text,
  style_om_value_id int references style_om_value(id),
  primary key (event_id, node_id, attribute_key), 
  foreign key (event_id, node_id) references attribute_mutation(event_id, node_id) 
);
```

## Columns

| Column              | Type       | Modifiers                                 |
|---------------------|------------|-------------------------------------------|
| `event_id`          | CHAR(36)   | PK, FK -> `attribute_mutation(event_id)`  |
| `node_id`           | INT        | PK, FK -> `attribute_mutation(node_id)`   |
| `attribute_key`     | CHAR(32)   | PK                                        |
| `string_value`      | TEXT       | Nullable                                  |
| `style_om_value_id` | INT        | Nullable, FK -> `style_om_value(id)`      |

## Keys & Constraints

-   **Primary Key:** A composite key on (`event_id`, `node_id`, `attribute_key`) ensures each attribute modification within a specific node of a specific event is unique.
-   **Foreign Key:** (`event_id`, `node_id`) references `attribute_mutation` (`event_id`, `node_id`). This links the specific attribute change back to the overall attribute mutation event for a node.
    *   **Note:** The schema definition provided does *not* include `ON DELETE CASCADE`. If an `attribute_mutation` record is deleted, these entries might become orphaned. Adding `ON DELETE CASCADE` would be recommended for data integrity.
-   **Foreign Key:** (`style_om_value_id`) references `style_om_value` (`id`). This is likely used if the attribute value being set is a complex style object (needs confirmation based on rrweb serialization details).

## Referenced By

-   (No other tables directly reference `attribute_mutation_entry`)

## Usage Context

-   This table is populated during the processing of replay data (e.g., in `/api/save-replay`).
-   When an incremental snapshot event of type 'mutation' occurs, and it specifically targets attributes, one or more rows are inserted into this table detailing each attribute that was added, modified, or removed (removal might be represented by a null `string_value`).

## Execution Notes

-   Stores the granular detail of attribute changes.
-   The `string_value` holds the new value of the attribute. A `NULL` value might indicate attribute removal, depending on how rrweb events are processed.
-   The link to `style_om_value` suggests handling for complex style attributes. 