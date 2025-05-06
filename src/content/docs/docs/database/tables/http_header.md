---
title: http_header Table
description: Stores HTTP headers for network requests and responses.
---

Contains key-value pairs for HTTP headers, associated with a specific `network_request` and indicating whether they belong to the request or the response.

## Columns

| Column        | Type          | Modifiers                   |
|---------------|---------------|-----------------------------|
| `request_id`  | `CHAR(36)`    | PK, FK(ref: network_request)|
| `type`        | `ENUM('request', 'response')` | PK                          |
| `key`         | `VARCHAR(128)`| PK                          |
| `value`       | `TEXT`        | NOT NULL                    |

## Keys & Constraints

- **Primary Key:** (`request_id`, `type`, `key`)
- **Foreign Key:** `fk_http_header_network_request` (`request_id`) -> `network_request` (`request_id`)

## Referenced By

- (No tables reference this one directly) 