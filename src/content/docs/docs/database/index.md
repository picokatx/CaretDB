---
title: Database Schema Overview
description: An overview of the CaretDB database structure.
---

This section provides documentation for the CaretDB database schema.

## Schema Structure

The database is designed to store detailed information about user web sessions, including DOM snapshots, user interactions, console logs, and network requests. Key relationships include:

-   A `replay` belongs to a `webstate` (initial page state).
-   `event` records belong to a `replay`.
-   Specific event details (like mutations, mouse movements, etc.) are stored in tables linked to `incremental_snapshot_event`.
-   DOM nodes are stored in `serialized_node` and related tables.

## Table Documentation

Select a table from the sidebar under "Tables" for detailed column information, keys, and relationships.

## Other Objects

-   **[Stored Procedures](./../procedures)**: Describes procedures like `generate_monthly_report`.
-   **[Events](./../events)**: Details the MySQL scheduled event `monthly_report_scheduler`.
-   **[Triggers](./../triggers)**: Explains the `before_input_data_insert_mask` trigger. 