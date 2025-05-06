---
title: monthly_reports Table
description: Stores generated monthly summary reports.
---

This table holds aggregated data generated monthly, likely by a stored procedure or scheduled event, summarizing activity over the past month.

## Columns

| Column             | Type           | Modifiers       |
|--------------------|----------------|-----------------|
| `report_id`        | `INT`          | PK, AUTO_INCREMENT|
| `report_month`     | `DATE`         | NOT NULL, UK    |
| `total_replays`    | `INT`          | NOT NULL, DEFAULT: 0 |
| `avg_duration`     | `DECIMAL(10, 2)`| NOT NULL, DEFAULT: 0 |
| `total_errors`     | `INT`          | NOT NULL, DEFAULT: 0 |
| `new_users`        | `INT`          | NOT NULL, DEFAULT: 0 |
| `generated_at`     | `TIMESTAMP`    | NOT NULL, DEFAULT: CURRENT_TIMESTAMP |

## Keys & Constraints

- **Primary Key:** (`report_id`)
- **Unique Key:** `uk_report_month` (`report_month`)

## Referenced By

- (No tables reference this one directly) 