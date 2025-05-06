---
title: Database Schema
description: Overview of the project's database tables and structure based on build_schema.sql.
---

This document outlines the structure of the CaretDB database, generated from `src/lib/build_schema.sql`.

## Tables

### `user`

Stores user account information.

- `email_domain` (VARCHAR(255), PK, FK(ref: self uk_user_email), NOT NULL)
- `email_name` (VARCHAR(64), PK, FK(ref: self uk_user_email), NOT NULL)
- `username` (VARCHAR(64), CHECK)
- `password` (VARCHAR(4096), CHECK)
- `created_at` (TIMESTAMP, NOT NULL)
- `last_login` (TIMESTAMP)
- `status` (VARCHAR(16), CHECK(`enabled`, `disabled`))
- `first_name` (VARCHAR(128))
- `middle_name` (VARCHAR(128))
- `last_name` (VARCHAR(128))
- `phone_num` (CHAR(11))
- `role` (VARCHAR(16), CHECK(`user`, `admin`))
- `verified` (BOOLEAN, NOT NULL, DEFAULT: false)
- `fail_login` (INT, NOT NULL, DEFAULT: 0, CHECK >= 0)
- `twofa` (BOOLEAN, NOT NULL, DEFAULT: false)
- `privacy_mask` (BOOLEAN, NOT NULL, DEFAULT: true)
- **Primary Key:** (`email_name`, `email_domain`)
- **Unique Key:** `uk_user_email` (`email_domain`, `email_name`)

### `webstate`

Stores unique HTML page states (snapshots).

- `created_at` (TIMESTAMP, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- `html_hash` (CHAR(64), PK, CHECK(regexp))
- `email_domain` (VARCHAR(255), FK(ref: user))
- `email_name` (VARCHAR(64), FK(ref: user))
- **Primary Key:** (`html_hash`)
- **Foreign Key:** `fk_webstate_user` (`email_domain`, `email_name`) -> `user` (`email_domain`, `email_name`)
- **Index:** `idx_webstate_created_at` (`created_at`)

### `replay`

Stores metadata about a user recording session.

- `replay_id` (CHAR(36), PK)
- `html_hash` (CHAR(64), NOT NULL, FK(ref: webstate))
- `start_time` (TIMESTAMP, NOT NULL)
- `end_time` (TIMESTAMP, NOT NULL, CHECK(start <= end))
- `product` (VARCHAR(24), CHECK(enum))
- `product_version` (VARCHAR(24), CHECK(regexp))
- `comment` (VARCHAR(255))
- `device_type` (VARCHAR(24), CHECK(enum))
- `os_type` (VARCHAR(24), CHECK(enum))
- `os_version` (VARCHAR(16), CHECK(regexp))
- `network_id` (VARCHAR(15), CHECK(regexp))
- `host_id` (VARCHAR(4096), CHECK(regexp))
- `d_viewport_height` (INT, CHECK(> 0))
- `d_viewport_width` (INT, CHECK(> 0))
- **Primary Key:** (`replay_id`)
- **Foreign Key:** `fk_replay_webstate` (`html_hash`) -> `webstate` (`html_hash`)

### `serialized_node`

Represents nodes (elements, text, etc.) within a captured DOM snapshot.

- `id` (INT, PK)
- `type` (ENUM('document','documenttype','element','text','cdata','comment'), NOT NULL)
- `root_id` (INT)
- `is_shadow_host` (BOOLEAN, NOT NULL, DEFAULT: false)
- `is_shadow` (BOOLEAN, NOT NULL, DEFAULT: false)
- `compat_mode` (TEXT)
- `name` (TEXT)
- `public_id` (TEXT)
- `system_id` (TEXT)
- `tag` (VARCHAR(24))
- `is_svg` (BOOLEAN, NOT NULL, DEFAULT: false)
- `need_block` (BOOLEAN, NOT NULL, DEFAULT: false)
- `is_custom` (BOOLEAN, NOT NULL, DEFAULT: false)
- `text_content` (TEXT)
- **Primary Key:** (`id`)

### `serialized_node_child`

Links parent nodes to their child nodes.

- `parent_id` (INT, PK, FK(ref: serialized_node), NOT NULL)
- `child_id` (INT, PK, FK(ref: serialized_node), NOT NULL)
- **Primary Key:** (`parent_id`, `child_id`)
- **Foreign Keys:** (`parent_id`) -> `serialized_node` (`id`), (`child_id`) -> `serialized_node` (`id`)

### `serialized_node_attribute`

Stores attributes of serialized element nodes.

- `node_id` (INT, PK, FK(ref: serialized_node), NOT NULL)
- `attribute_key` (VARCHAR(32), PK, NOT NULL)
- `string_value` (TEXT)
- `number_value` (NUMERIC)
- `is_true` (BOOLEAN, NOT NULL, DEFAULT: false)
- `is_null` (BOOLEAN, NOT NULL, DEFAULT: false)
- **Primary Key:** (`node_id`, `attribute_key`)
- **Foreign Key:** (`node_id`) -> `serialized_node` (`id`)

### `style_om_value`

Helper table for storing complex style values (if needed).

- `id` (INT, PK, AUTO_INCREMENT)
- **Primary Key:** (`id`)

### `style_om_value_entry`

Stores individual properties of a StyleOM value.

- `id` (INT, PK)
- `property` (CHAR(32), PK, NOT NULL)
- `value_string` (TEXT)
- `priority` (TEXT)
- **Primary Key:** (`id`, `property`)

### `event`

Base table for all recorded events within a replay.

- `event_id` (CHAR(36), PK)
- `replay_id` (CHAR(36), NOT NULL, FK(ref: replay))
- `type` (ENUM('fullsnapshot','incrementalsnapshot','meta'), NOT NULL)
- `timestamp` (TIMESTAMP, NOT NULL)
- `delay` (INT)
- **Primary Key:** (`event_id`)
- **Foreign Key:** `fk_event_replay` (`replay_id`) -> `replay` (`replay_id`)

### `full_snapshot_event`

Data specific to full DOM snapshot events.

- `event_id` (CHAR(36), PK, FK(ref: event))
- `node_id` (INT, NOT NULL, FK(ref: serialized_node))
- `initial_offset_top` (INT, NOT NULL)
- `initial_offset_left` (INT, NOT NULL)
- **Primary Key:** (`event_id`)
- **Foreign Keys:** (`event_id`) -> `event` (`event_id`), (`node_id`) -> `serialized_node` (`id`)

### `meta_event`

Data specific to meta events (e.g., initial URL, viewport size).

- `event_id` (CHAR(36), PK, FK(ref: event))
- `href` (TEXT, NOT NULL)
- `width` (INT, NOT NULL)
- `height` (INT, NOT NULL)
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `event` (`event_id`)

### `incremental_snapshot_event`

Links base events to specific types of incremental updates.

- `event_id` (CHAR(36), PK, FK(ref: event))
- `t` (ENUM(...), NOT NULL) - Specifies the type of incremental change (mutation, mousemove, etc.)
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `event` (`event_id`)

### `mutation_data`

Base table for DOM mutation events.

- `event_id` (CHAR(36), PK, FK(ref: incremental_snapshot_event))
- `is_attach_iframe` (BOOLEAN, NOT NULL, DEFAULT: false)
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `incremental_snapshot_event` (`event_id`)

### `text_mutation`

Details for text node changes.

- `event_id` (CHAR(36), PK, FK(ref: mutation_data), NOT NULL)
- `node_id` (INT, PK, NOT NULL)
- `value` (TEXT)
- **Primary Key:** (`event_id`, `node_id`)
- **Foreign Key:** (`event_id`) -> `mutation_data` (`event_id`)

### `attribute_mutation`

Links attribute changes to a mutation event.

- `event_id` (CHAR(36), PK, FK(ref: mutation_data), NOT NULL)
- `node_id` (INT, PK, NOT NULL)
- **Primary Key:** (`event_id`, `node_id`)
- **Foreign Key:** (`event_id`) -> `mutation_data` (`event_id`)

### `attribute_mutation_entry`

Stores the actual attribute changes (key/value pairs).

- `event_id` (CHAR(36), PK, FK(ref: attribute_mutation), NOT NULL)
- `node_id` (INT, PK, FK(ref: attribute_mutation), NOT NULL)
- `attribute_key` (CHAR(32), PK, NOT NULL)
- `string_value` (TEXT)
- `style_om_value_id` (INT, FK(ref: style_om_value))
- **Primary Key:** (`event_id`, `node_id`, `attribute_key`)
- **Foreign Keys:** (`event_id`, `node_id`) -> `attribute_mutation` (`event_id`, `node_id`), (`style_om_value_id`) -> `style_om_value` (`id`)

### `removed_node_mutation`

Details for node removal mutations.

- `event_id` (CHAR(36), PK, FK(ref: mutation_data), NOT NULL)
- `parent_id` (INT, NOT NULL)
- `node_id` (INT, PK, NOT NULL)
- `is_shadow` (BOOLEAN, NOT NULL, DEFAULT: false)
- **Primary Key:** (`event_id`, `node_id`)
- **Foreign Key:** (`event_id`) -> `mutation_data` (`event_id`)

### `added_node_mutation`

Details for node addition mutations.

- `event_id` (CHAR(36), PK, FK(ref: mutation_data), NOT NULL)
- `parent_id` (INT, PK, NOT NULL)
- `next_id` (INT)
- `node_id` (INT, PK, FK(ref: serialized_node), NOT NULL)
- **Primary Key:** (`event_id`, `parent_id`, `node_id`)
- **Foreign Keys:** (`event_id`) -> `mutation_data` (`event_id`), (`node_id`) -> `serialized_node` (`id`)

### `mousemove_data`

Marker table for mouse movement incremental events.

- `event_id` (CHAR(36), PK, FK(ref: incremental_snapshot_event))
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `incremental_snapshot_event` (`event_id`)

### `mouse_position`

Stores coordinates and timing for mouse movement positions.

- `event_id` (CHAR(36), PK, FK(ref: mousemove_data), NOT NULL)
- `x` (INT, NOT NULL)
- `y` (INT, NOT NULL)
- `node_id` (INT, PK, NOT NULL)
- `time_offset` (INT, PK, NOT NULL)
- **Primary Key:** (`event_id`, `node_id`, `time_offset`)
- **Foreign Key:** (`event_id`) -> `mousemove_data` (`event_id`)

### `mouse_interaction_data`

Details for mouse interaction events (clicks, focus, etc.).

- `event_id` (CHAR(36), PK, FK(ref: incremental_snapshot_event))
- `interaction_type` (ENUM(...), NOT NULL)
- `node_id` (INT, NOT NULL)
- `x` (INT)
- `y` (INT)
- `pointer_type` (ENUM('mouse','pen','touch'))
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `incremental_snapshot_event` (`event_id`)

### `scroll_data`

Details for scroll events.

- `event_id` (CHAR(36), PK, FK(ref: incremental_snapshot_event))
- `node_id` (INT, NOT NULL)
- `x` (INT, NOT NULL)
- `y` (INT, NOT NULL)
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `incremental_snapshot_event` (`event_id`)

### `viewport_resize_data`

Details for viewport resize events.

- `event_id` (CHAR(36), PK, FK(ref: incremental_snapshot_event))
- `width` (INT, NOT NULL)
- `height` (INT, NOT NULL)
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `incremental_snapshot_event` (`event_id`)

### `input_data`

Details for input element change events.

- `event_id` (CHAR(36), PK, FK(ref: incremental_snapshot_event))
- `node_id` (INT, NOT NULL)
- `text` (TEXT, NOT NULL) - *May be masked by trigger*
- `is_checked` (BOOLEAN, NOT NULL)
- `user_triggered` (BOOLEAN, NOT NULL, DEFAULT: false)
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `incremental_snapshot_event` (`event_id`)

### `media_interaction_data`

Details for media element interaction events (play, pause, etc.).

- `event_id` (CHAR(36), PK, FK(ref: incremental_snapshot_event))
- `interaction_type` (ENUM('play','pause','seeked','volumechange','ratechange'), NOT NULL)
- `node_id` (INT, NOT NULL)
- `time` (DECIMAL(8,4))
- `volume` (DECIMAL(8,4))
- `muted` (BOOLEAN)
- `isloop` (BOOLEAN)
- `playback_rate` (DECIMAL(8,4))
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `incremental_snapshot_event` (`event_id`)

### `font_data`

Base table for font loading events.

- `event_id` (CHAR(36), PK, FK(ref: incremental_snapshot_event))
- `family` (TEXT, NOT NULL)
- `font_source` (TEXT, NOT NULL)
- `buffer` (BOOLEAN, NOT NULL)
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `incremental_snapshot_event` (`event_id`)

### `font_descriptor`

Stores descriptors for loaded fonts.

- `id` (SERIAL, PK)
- `event_id` (CHAR(36), NOT NULL, FK(ref: font_data))
- `descriptor_key` (TEXT, NOT NULL)
- `descriptor_value` (TEXT, NOT NULL)
- **Primary Key:** (`id`)
- **Foreign Key:** (`event_id`) -> `font_data` (`event_id`)

### `selection_data`

Base table for text selection change events.

- `event_id` (CHAR(36), PK, FK(ref: incremental_snapshot_event))
- **Primary Key:** (`event_id`)
- **Foreign Key:** (`event_id`) -> `incremental_snapshot_event` (`event_id`)

### `selection_range`

Stores the range(s) of a text selection.

- `id` (SERIAL, PK)
- `event_id` (CHAR(36), NOT NULL, FK(ref: selection_data))
- `start` (INT, NOT NULL)
- `start_offset` (INT, NOT NULL)
- `end` (INT, NOT NULL)
- `end_offset` (INT, NOT NULL)
- **Primary Key:** (`id`)
- **Foreign Key:** (`event_id`) -> `selection_data` (`event_id`)

### `console_log`

Stores captured browser console log messages.

- `log_id` (CHAR(36), PK)
- `replay_id` (CHAR(36), NOT NULL, FK(ref: replay))
- `level` (ENUM('log', 'warn', 'error', 'info', 'debug'), NOT NULL)
- `payload` (JSON, NOT NULL)
- `delay` (INT, NOT NULL)
- `timestamp` (TIMESTAMP, NOT NULL)
- `trace` (TEXT)
- **Primary Key:** (`log_id`)
- **Foreign Key:** `fk_console_log_replay` (`replay_id`) -> `replay` (`replay_id`)

### `network_request`

Stores captured network request information.

- `request_log_id` (CHAR(36), PK)
- `replay_id` (CHAR(36), NOT NULL, FK(ref: replay) ON DELETE CASCADE)
- `request_session_id` (VARCHAR(64), NOT NULL)
- `url` (TEXT, NOT NULL)
- `method` (VARCHAR(16), NOT NULL)
- `status_code` (SMALLINT UNSIGNED)
- `status_text` (VARCHAR(255))
- `request_type` (VARCHAR(32))
- `initiator_type` (VARCHAR(32))
- `start_time_offset` (INT UNSIGNED, NOT NULL)
- `end_time_offset` (INT UNSIGNED)
- `duration_ms` (INT UNSIGNED)
- `absolute_timestamp` (TIMESTAMP, NOT NULL)
- `request_headers` (JSON)
- `response_headers` (JSON)
- `response_size_bytes` (INT UNSIGNED)
- `performance_data` (JSON)
- `is_fetch_complete` (BOOLEAN)
- `is_perf_complete` (BOOLEAN)
- **Primary Key:** (`request_log_id`)
- **Foreign Key:** `fk_network_request_replay` (`replay_id`) -> `replay` (`replay_id`)
- **Index:** `idx_network_request_replay_id` (`replay_id`)

### `cookie`

Stores cookie information associated with webstates.

- `name` (VARCHAR(256), PK)
- `html_hash` (CHAR(64), PK, FK(ref: webstate))
- `path` (VARCHAR(256), CHECK)
- `secure` (BOOLEAN, NOT NULL, DEFAULT: false)
- `http_only` (BOOLEAN, NOT NULL, DEFAULT: false)
- `size` (INT, CHECK(1-4096))
- `expiry` (TIMESTAMP)
- `domain` (VARCHAR(4096), CHECK(regexp))
- `value` (VARCHAR(4096))
- `same_site` (VARCHAR(20), CHECK(`strict`, `lax`, `none`))
- `last_accessed` (TIMESTAMP)
- **Primary Key:** (`name`, `html_hash`)
- **Foreign Key:** (`html_hash`) -> `webstate` (`html_hash`)

### `replay_summary`

Summary table aggregating clicks per replay session.

- `replay_id` (CHAR(36), PK, FK(ref: replay) ON DELETE CASCADE)
- `html_hash` (CHAR(64), NOT NULL, FK(ref: webstate) ON DELETE CASCADE)
- `click_count` (INT, NOT NULL, DEFAULT: 0)
- `last_updated` (TIMESTAMP, DEFAULT: CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- **Primary Key:** (`replay_id`)
- **Foreign Keys:** `fk_replay_summary_replay` (`replay_id`) -> `replay` (`replay_id`), `fk_replay_summary_webstate` (`html_hash`) -> `webstate` (`html_hash`)

### `monthly_reports`

Stores aggregated data for monthly reports.

- `report_id` (INT, PK, AUTO_INCREMENT)
- `report_month_start` (DATE, NOT NULL, UK)
- `report_month_end` (DATE, NOT NULL)
- `generated_at` (TIMESTAMP, NOT NULL, DEFAULT: CURRENT_TIMESTAMP)
- `new_users_count` (INT UNSIGNED, NOT NULL, DEFAULT: 0)
- `new_webstates_count` (INT UNSIGNED, NOT NULL, DEFAULT: 0)
- `new_replays_count` (INT UNSIGNED, NOT NULL, DEFAULT: 0)
- `new_events_count` (BIGINT UNSIGNED, NOT NULL, DEFAULT: 0)
- `total_users_end` (INT UNSIGNED, NOT NULL, DEFAULT: 0)
- `total_webstates_end` (INT UNSIGNED, NOT NULL, DEFAULT: 0)
- `total_replays_end` (INT UNSIGNED, NOT NULL, DEFAULT: 0)
- `total_events_end` (BIGINT UNSIGNED, NOT NULL, DEFAULT: 0)
- **Primary Key:** (`report_id`)
- **Unique Key:** `uk_report_month` (`report_month_start`)

## Indexing Strategy (Conceptual)

Proper indexing is crucial for query performance.

- **Primary Keys:** Already defined for each table (`user_id`, `html_hash`, `replay_id`, `event_id`, `report_id`).
- **Foreign Keys:** Indexes should automatically be created for foreign keys (`replays.user_id`, `events.replay_id`, potentially `events.webstate_hash`) by most database systems, but verify this.
- **Common Lookups:** 
    - `users.email`: Needs a UNIQUE index for login lookups.
    - `replays.start_time`: An index is essential for ordering/fetching recent replays.
    - `events.replay_id` and `events.timestamp`: A composite index on `(replay_id, timestamp)` would be highly beneficial for fetching events for a specific replay in chronological order.
    - `monthly_reports.report_month_start`: An index is needed for ordering and fetching reports by date.

## Stored Procedures

### `update_analysis_summaries(p_replay_id, p_html_hash)`

- **Purpose:** Calculates the total click count for a given `replay_id` and inserts or updates the corresponding row in the `replay_summary` table.
- **Triggering:** Intended to be called from application logic after a replay is fully processed (trigger was removed due to potential timing issues).

### `generate_monthly_report()`

- **Purpose:** Calculates statistics (new users, replays, etc.) for the *previous* full calendar month and inserts a new row into the `monthly_reports` table if one doesn't already exist for that month.
- **Triggering:** Called automatically by the `monthly_report_scheduler` event.

## Events (MySQL Scheduler)

### `monthly_report_scheduler`

- **Purpose:** Executes the `generate_monthly_report()` stored procedure.
- **Schedule:** Runs once per month, on the 2nd day of the month at 02:00 AM.
- **Requirement:** The MySQL Event Scheduler must be enabled on the server (`SET GLOBAL event_scheduler = ON;`).

## Triggers

### `before_input_data_insert_mask`

- **Purpose:** Masks the `text` field in the `input_data` table with asterisks ('*') before insertion if the associated user's `privacy_mask` setting is true.
- **Mechanism:** Looks up the user associated with the event's replay via the `webstate` table and checks their `privacy_mask` flag.
- **Warning:** This trigger involves multiple lookups and may impact insert performance for `input_data` events.

---

**Please replace the above conceptual structure with your actual `CREATE TABLE` statements or equivalent schema definition.** 