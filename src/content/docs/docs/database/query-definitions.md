---
title: SQL Query Definitions (`sql_query_locale.ts`)
description: Details about the file containing predefined SQL queries.
---

The file `src/lib/sql_query_locale.ts` plays a crucial role in managing database interactions securely and centrally.

## Purpose

- **Centralization:** It acts as a single source of truth for all SQL queries used by the application's backend API (`/api/query_mysql`).
- **Abstraction:** It maps simple string identifiers (keys) to potentially complex SQL query strings (values).
- **Security:** By only allowing queries defined in this file to be executed via the API, it prevents arbitrary SQL execution and mitigates SQL injection vulnerabilities.

## Query Definitions

Below is a list of all query identifiers defined in the `sqlQueries` object within `src/lib/sql_query_locale.ts` and their intended purpose.

### Webstate Queries

- **`insertWebstateHash`**: Inserts a new HTML hash into the `webstate` table. Expects `html_hash` as a parameter.

### User Queries

- **`selectUserByEmailOrUsername`**: Checks if a user exists by email (name and domain) or username. Used for registration checks. Expects `email_name`, `email_domain`, `username`.
- **`insertUser`**: Inserts a new user record. Expects `email_domain`, `email_name`, `username`, `password`, `created_at`, `status`, `role`, `verified`, `fail_login`, `twofa`.

### Schema Build

- **`buildSchemaQuery`**: Contains the entire SQL script loaded from `build_schema.sql` for rebuilding the database schema.

### Analysis Queries (Dashboard, Analysis Page)

- **`countUsers`**: Counts the total number of users.
- **`countWebstates`**: Counts the total number of unique webstates.
- **`countReplays`**: Counts the total number of replay sessions.
- **`countEvents`**: Counts the total number of recorded events.
- **`eventsOverTime`**: Counts events grouped by date.
- **`clickEventsOverTime`**: Counts click events grouped by date.
- **`clickEventsPerSecond`**: Counts click events grouped by the exact second they occurred.
- **`clicksPerReplay`**: Retrieves the click count for each replay from the `replay_summary` table, ordered by replay start time.
- **`listReplays`**: Lists all replay IDs and their formatted start times, ordered by most recent.
- **`listWebstateHashes`**: Lists all unique webstate hashes, ordered by hash.
- **`defaultUserQuery`**: A simple query to select all columns from the `user` table (likely for the database browser page).

### Save Replay Queries (`save-replay.ts`)

These queries handle inserting the detailed data captured during a recording session:

- **`insertSerializedNode`**: Inserts or updates a serialized DOM node. Expects node details.
- **`insertSerializedNodeAttribute`**: Inserts or updates attributes for a serialized node. Expects `node_id`, `attribute_key`, values.
- **`linkSerializedNodeChild`**: Links a parent node to a child node. Expects `parent_id`, `child_id`.
- **`insertReplay`**: Inserts metadata for a new replay session. Expects replay details.
- **`insertBaseEvent`**: Inserts a base event record (common fields). Expects `event_id`, `replay_id`, `type`, `timestamp`, `delay`.
- **`insertMetaEvent`**: Inserts data for a `meta` event. Expects `event_id`, `href`, `width`, `height`.
- **`insertFullSnapshotEvent`**: Inserts data for a `fullsnapshot` event. Expects `event_id`, `node_id`, `initial_offset_top`, `initial_offset_left`.
- **`insertIncrementalSnapshotEvent`**: Inserts the type marker for an `incrementalsnapshot` event. Expects `event_id`, `t` (type enum).
- **`insertMouseInteractionData`**: Inserts data for mouse interaction events (click, focus, etc.). Expects `event_id`, `interaction_type`, `node_id`, `x`, `y`, `pointer_type`.
- **`insertMouseMoveData`**: Inserts the marker for a mouse move event. Expects `event_id`.
- **`insertMousePosition`**: Inserts individual position points for a mouse move event. Expects `event_id`, `x`, `y`, `node_id`, `time_offset`.
- **`insertScrollData`**: Inserts data for scroll events. Expects `event_id`, `node_id`, `x`, `y`.
- **`insertSelectionData`**: Inserts the marker for a text selection event. Expects `event_id`.
- **`insertSelectionRange`**: Inserts range details for a text selection event. Expects `event_id`, `start`, `start_offset`, `end`, `end_offset`.
- **`insertInputData`**: Inserts data for input change events. Expects `event_id`, `node_id`, `text`, `is_checked`, `user_triggered`.
- **`insertMediaInteractionData`**: Inserts data for media interaction events. Expects `event_id`, `interaction_type`, `node_id`, `time`, `volume`, `muted`, `isloop`, `playback_rate`.
- **`insertViewportResizeData`**: Inserts data for viewport resize events. Expects `event_id`, `width`, `height`.
- **`insertMutationData`**: Inserts the base record for a DOM mutation event. Expects `event_id`, `is_attach_iframe`.
- **`insertTextMutation`**: Inserts data for a text mutation. Expects `event_id`, `node_id`, `value`.
- **`insertAttributeMutationBase`**: Inserts the base record linking an attribute mutation to a node. Expects `event_id`, `node_id`.
- **`insertAttributeMutationEntry`**: Inserts the specific key/value change for an attribute mutation. Expects `event_id`, `node_id`, `attribute_key`, `string_value`.
- **`insertRemovedNodeMutation`**: Inserts data for a node removal mutation. Expects `event_id`, `parent_id`, `node_id`, `is_shadow`.
- **`insertAddedNodeMutation`**: Inserts data for a node addition mutation. Expects `event_id`, `parent_id`, `next_id`, `node_id`.
- **`insertConsoleLog`**: Inserts data for a captured console log message. Expects `log_id`, `replay_id`, `level`, `payload`, `delay`, `timestamp`, `trace`.

### Replay Analysis Queries (`replay_clicks`, `replay_events`)

- **`clicksPerSecondForReplay`**: Counts click events per second for a specific replay. Expects `replay_id`.
- **`eventsPerSecondForReplay`**: Counts all incremental snapshot events per second for a specific replay. Expects `replay_id`.

### Reporting Queries (`reports.astro`)

- **`listMonthlyReports`**: Selects all columns from the `monthly_reports` table, ordered by most recent month.

### User Settings Queries

- **`getUserPrivacyMask`**: Gets the `privacy_mask` setting for a specific user. Expects `email_domain`, `email_name`.
- **`updateUserPrivacyMask`**: Updates the `privacy_mask` setting for a user. Expects `privacy_mask` value, `email_domain`, `email_name`.
- **`getUserPasswordHash`**: Gets the stored password hash for a user. Expects `email_domain`, `email_name`.
- **`updateUserPasswordHash`**: Updates the password hash for a user. Expects new `password` hash, `email_domain`, `email_name`.
- **`updateUsernameByEmail`**: Updates the display `username` for a user. Expects `username`, `email_domain`, `email_name`.

### Network Request Queries

- **`insertNetworkRequest`**: Inserts a log entry for a captured network request. Expects many parameters detailing the request/response.

### Dashboard Queries

- **`listRecentReplays`**: Gets the 5 most recent replays (ID and formatted start time).
- **`getLatestMonthlyReport`**: Gets key details from the most recent monthly report.
- **`listRecentWebstates`**: Gets the 5 most recently created webstate hashes.