---
title: POST /api/save-replay
description: Saves a complete user recording session, including rrweb events, console logs, and network requests.
---

This is the main endpoint for persisting recorded user sessions. It accepts a payload containing rrweb events and optionally console logs and network request data, processes it, and saves it into multiple related database tables within a single transaction.

**Method:** `POST`

**Content-Type:** `application/json`

**Authentication:** Required. The endpoint expects a valid user session and uses the user ID.

**Request Body:**

A JSON object with the following structure:

```json
{
  "events": [ 
    // Array of rrweb event objects (eventWithTime format)
    // Example: { type: 0, data: {...}, timestamp: 1678886400000, delay: 0 }, ...
  ],
  "consoleLogs": [
    // Optional: Array of console log objects
    // Example: { level: "log", args: ["Hello"], timestamp: 1678886401000 }, ...
  ],
  "networkLogs": [
    // Optional: Array of network request log objects
    // Example: { id: "fetch-1", url: "...", method: "GET", status: 200, ..., startTime: 100, endTime: 300, duration: 200, timestamp: 1678886402000 }, ...
  ],
  "clientInfo": {
    // Optional: Information about the client environment
    "browser": { "name": "Chrome", "version": "12X.0.0.0" },
    "os": { "name": "Windows", "version": "10" },
    "device": { "type": "desktop" }, // Optional: mobile, tablet
    "ip": "192.168.1.100" // Client IP address
  }
}
```

- `events` (Array<eventWithTime>, required): An array of rrweb events captured during the recording. Must contain at least one event.
- `consoleLogs` (Array<ConsoleLog>, optional): An array of console messages captured by a plugin.
- `networkLogs` (Array<NetworkLog>, optional): An array of network requests captured by a plugin.
- `clientInfo` (Object, optional): Contains details about the client's browser, OS, device, and IP address.

**Processing Steps:**

1.  **Authentication Check:** Verifies a valid user session exists.
2.  **Data Validation:** Checks if the `events` array is present and non-empty.
3.  **Transaction Start:** Begins a database transaction.
4.  **Metadata Extraction:**
    - Generates a unique `replay_id` (UUID).
    - Extracts start and end timestamps from the first and last events.
    - Determines the `html_hash` by parsing the `href` from the first `Meta` event.
    - Extracts browser, OS, device type, viewport dimensions, and IP address from `clientInfo` or event data.
5.  **Replay Record Insertion:** Inserts the main record into the `replay` table.
6.  **Event Processing (Loop):** Iterates through each object in the `events` array:
    - Inserts a base record into the `event` table.
    - Based on the event `type` (`Meta`, `FullSnapshot`, `IncrementalSnapshot`):
        - **Meta:** Inserts into `meta_event`.
        - **FullSnapshot:** Recursively saves the entire DOM node tree (`serialized_node`, `serialized_node_child`, `serialized_node_attribute`) using the `saveSerializedNode` helper function, then inserts into `full_snapshot_event`.
        - **IncrementalSnapshot:** Inserts into `incremental_snapshot_event` with the specific `source` type (enum `t`). Then, based on the `source`, inserts detailed data into the corresponding table (`mutation_data` and its children, `mousemove_data`/`mouse_position`, `mouse_interaction_data`, `scroll_data`, `viewport_resize_data`, `input_data`, `media_interaction_data`, `font_data`/`font_descriptor`, `selection_data`/`selection_range`).
7.  **Console Log Insertion (Loop):** If `consoleLogs` are present, iterates through them and inserts records into the `console_log` table.
8.  **Network Log Insertion (Loop):** If `networkLogs` are present, iterates through them and inserts records into the `network_request` table.
9.  **Transaction Commit:** If all insertions are successful, commits the transaction.
10. **Response:** Returns a success message with the generated `replay_id`.

**Success Response (201 Created):**

```json
{
  "message": "Recording saved successfully",
  "replayId": "<generated_uuid>"
}
```

**Error Response:**

- **400 Bad Request:** If `events` array is missing or empty, or if the `html_hash` cannot be determined from the event data.
  ```json
  {
    "message": "Missing or invalid recording events"
  }
  ```
  ```json
  {
    "message": "Could not determine webstate hash from recording data"
  }
  ```
- **401 Unauthorized:** If no valid user session is found.
  ```json
  {
    "message": "Unauthorized"
  }
  ```
- **500 Internal Server Error:** If any database error occurs during the transaction. The transaction is rolled back.
  ```json
  {
    "message": "Error saving replay: <database error message>",
    "error": { ... } // Original error object details
  }
  ```

**Notes:**

- This endpoint performs a large number of database inserts within a transaction. Performance depends heavily on database configuration and server resources.
- It relies heavily on the structure defined in `rrtypes.ts` matching the incoming data.
- The `saveSerializedNode` function recursively handles the complex task of saving the DOM structure.
- Error handling includes rolling back the transaction to maintain data integrity.
- Uses numerous `insert*` queries defined in `sql_query_locale.ts`. 