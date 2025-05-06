---
title: webstate Table
description: Stores unique HTML page states (snapshots).
---

This table stores the unique hash of captured HTML DOM snapshots, associating them with the user who captured them (indirectly via replay) and when they were first seen.

## Columns

| Column         | Type           | Modifiers                                    |
|----------------|----------------|----------------------------------------------|
| `created_at`   | `TIMESTAMP`    | NOT NULL, DEFAULT: CURRENT_TIMESTAMP         |
| `html_hash`    | `CHAR(64)`     | PK, CHECK(regexp)                            |
| `email_domain` | `VARCHAR(255)` | FK(ref: user)                                |
| `email_name`   | `VARCHAR(64)`  | FK(ref: user)                                |

## Keys & Constraints

- **Primary Key:** (`html_hash`)
- **Foreign Key:** `fk_webstate_user` (`email_domain`, `email_name`) -> `user` (`email_domain`, `email_name`)

## Indexes

- `idx_webstate_created_at` (`created_at`)

## Referenced By

- `replay` (`fk_replay_webstate`)
- `replay_summary` (`fk_replay_summary_webstate`)
- `cookie` 