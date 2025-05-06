---
title: user Table
description: Stores user account information.
---

This table holds information about registered users, including credentials, profile details, and settings.

## Columns

| Column         | Type           | Modifiers                                   |
|----------------|----------------|---------------------------------------------|
| `email_domain` | `VARCHAR(255)` | PK, FK(ref: self uk_user_email), NOT NULL |
| `email_name`   | `VARCHAR(64)`  | PK, FK(ref: self uk_user_email), NOT NULL |
| `username`     | `VARCHAR(64)`  | CHECK                                       |
| `password`     | `VARCHAR(4096)`| CHECK                                       |
| `created_at`   | `TIMESTAMP`    | NOT NULL                                    |
| `last_login`   | `TIMESTAMP`    |                                             |
| `status`       | `VARCHAR(16)`  | CHECK(`enabled`, `disabled`)                |
| `first_name`   | `VARCHAR(128)` |                                             |
| `middle_name`  | `VARCHAR(128)` |                                             |
| `last_name`    | `VARCHAR(128)` |                                             |
| `phone_num`    | `CHAR(11)`     |                                             |
| `role`         | `VARCHAR(16)`  | CHECK(`user`, `admin`)                      |
| `verified`     | `BOOLEAN`      | NOT NULL, DEFAULT: false                    |
| `fail_login`   | `INT`          | NOT NULL, DEFAULT: 0, CHECK >= 0            |
| `twofa`        | `BOOLEAN`      | NOT NULL, DEFAULT: false                    |
| `privacy_mask` | `BOOLEAN`      | NOT NULL, DEFAULT: true                     |

## Keys & Constraints

- **Primary Key:** (`email_name`, `email_domain`)
- **Unique Key:** `uk_user_email` (`email_domain`, `email_name`)

## Referenced By

- `webstate` (`fk_webstate_user`) 