---
title: cookie Table
description: Stores cookie information associated with a web state.
---

Records cookies present for a given web state (HTML snapshot).

## Columns

| Column     | Type           | Modifiers             |
|------------|----------------|-----------------------|
| `html_hash`| `CHAR(64)`     | PK, FK(ref: webstate) |
| `name`     | `VARCHAR(255)` | PK                    |
| `value`    | `TEXT`         | NOT NULL              |
| `domain`   | `VARCHAR(255)` |                       |
| `path`     | `VARCHAR(255)` |                       |
| `expires`  | `BIGINT`       |                       |
| `http_only`| `BOOLEAN`      |                       |
| `secure`   | `BOOLEAN`      |                       |
| `same_site`| `ENUM('Strict', 'Lax', 'None')` |      |

## Keys & Constraints

- **Primary Key:** (`html_hash`, `name`)
- **Foreign Key:** `fk_cookie_webstate` (`html_hash`) -> `webstate` (`html_hash`)

## Referenced By

- (No tables reference this one directly) 