---
title: Database Schema
description: Overview of the project's database tables and structure.
---

This document outlines the structure of the primary database used by the application.

*Note: This is a placeholder based on observed features. Please replace with the actual SQL schema definitions.* 

## Conceptual Tables

Based on the application features and API usage, the following tables (or similar) are likely present:

*Relationships between tables are inferred (e.g., a replay belongs to a user, events belong to a replay). Explicit foreign key constraints are recommended.* 

### `users`

Stores information about registered users.

- `user_id` (Primary Key) - Likely UUID or auto-incrementing integer.
- `email` (VARCHAR, UNIQUE) - User's email address.
- `name` (VARCHAR) - User's display name.
- `created_at` (TIMESTAMP) - When the user record was created.
- Potentially fields related to authentication providers (e.g., `github_id`)

### `webstates`

Stores captured DOM snapshots (HTML content).

- `html_hash` (VARCHAR, Primary Key) - A hash (e.g., SHA256) of the `html_content`. Used for deduplication.
- `html_content` (LONGTEXT/BLOB) - The full HTML source of the captured page state.
- `captured_at` (TIMESTAMP) - When this webstate was first recorded.

### `replays`

Stores metadata about user recording sessions.

- `replay_id` (VARCHAR/UUID, Primary Key) - Unique identifier for a session.
- `user_id` (Foreign Key referencing `users.user_id`) - The user who initiated the replay.
- `start_time` (TIMESTAMP) - When the recording started.
- `end_time` (TIMESTAMP, NULLABLE) - When the recording ended (might be null if ongoing or abruptly terminated).
- `initial_url` (VARCHAR/TEXT) - The URL where the recording session began.

### `events`

Stores individual events recorded during a replay session.

- `event_id` (BIGINT/UUID, Primary Key) - Unique identifier for the event.
- `replay_id` (Foreign Key referencing `replays.replay_id`) - The session this event belongs to.
- `timestamp` (TIMESTAMP/BIGINT) - Precise time the event occurred, relative to the replay start or absolute.
- `event_type` (VARCHAR/ENUM) - Type of event (e.g., 'click', 'keypress', 'scroll', 'dom_mutation', 'viewport_resize').
- `event_data` (JSON/TEXT) - Serialized data specific to the event type (e.g., coordinates for click, keys pressed, mutation details).
- Potentially `webstate_hash` (Foreign Key referencing `webstates`) if linking events to specific DOM states).

### `monthly_reports`

Stores aggregated data for monthly reports.

- `report_id` (Primary Key)
- `report_month_start` (Date/Timestamp)
- `new_users_count`
- `total_users_end`
- `new_replays_count`
- `total_replays_end`
- `generated_at`

## Indexing Strategy (Conceptual)

Proper indexing is crucial for query performance.

- **Primary Keys:** Already defined for each table (`user_id`, `html_hash`, `replay_id`, `event_id`, `report_id`).
- **Foreign Keys:** Indexes should automatically be created for foreign keys (`replays.user_id`, `events.replay_id`, potentially `events.webstate_hash`) by most database systems, but verify this.
- **Common Lookups:** 
    - `users.email`: Needs a UNIQUE index for login lookups.
    - `replays.start_time`: An index is essential for ordering/fetching recent replays.
    - `events.replay_id` and `events.timestamp`: A composite index on `(replay_id, timestamp)` would be highly beneficial for fetching events for a specific replay in chronological order.
    - `monthly_reports.report_month_start`: An index is needed for ordering and fetching reports by date.

---

**Please replace the above conceptual structure with your actual `CREATE TABLE` statements or equivalent schema definition.** 