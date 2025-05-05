import * as fs from 'node:fs';
import buildSchemaSqlContent from './build_schema.sql?raw'; // Use Vite's raw import


export const sqlQueries = {
  // webstate queries
  insertWebstateHash: 'INSERT INTO webstate (html_hash) VALUES (?)',

  // user queries
  selectUserByEmailOrUsername: 'SELECT 1 FROM user WHERE (email_name = ? AND email_domain = ?) OR username = ? LIMIT 1',
  insertUser: `INSERT INTO user (
    email_domain, email_name, username, password, 
    created_at, status, role, verified, fail_login, twofa
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  // Load the build schema query from the SQL file
  buildSchemaQuery: buildSchemaSqlContent,

  // Analysis queries
  countUsers: "SELECT COUNT(*) as count FROM user;",
  countWebstates: "SELECT COUNT(*) as count FROM webstate;",
  countReplays: "SELECT COUNT(*) as count FROM replay;",
  countEvents: "SELECT COUNT(*) as count FROM event;",
  eventsOverTime: "SELECT DATE(timestamp) as date, COUNT(event_id) as count FROM event GROUP BY DATE(timestamp) ORDER BY date ASC;",
  clickEventsOverTime: `
    SELECT 
        DATE(e.timestamp) as date, 
        COUNT(e.event_id) as count 
    FROM event e
    JOIN incremental_snapshot_event ise ON e.event_id = ise.event_id
    JOIN mouse_interaction_data mid ON ise.event_id = mid.event_id
    WHERE 
        ise.t = 'mouseinteraction' AND mid.interaction_type = 'click'
    GROUP BY DATE(e.timestamp)
    ORDER BY date ASC;
  `,
  clickEventsPerSecond: `
    SELECT 
        DATE_FORMAT(e.timestamp, '%Y-%m-%d %H:%i:%s') as second, 
        COUNT(e.event_id) as count 
    FROM event e
    JOIN incremental_snapshot_event ise ON e.event_id = ise.event_id
    JOIN mouse_interaction_data mid ON ise.event_id = mid.event_id
    WHERE 
        ise.t = 'mouseinteraction' AND mid.interaction_type = 'click'
    GROUP BY second
    ORDER BY second ASC;
  `,
  clicksPerReplay: `
    SELECT
        r.replay_id,
        DATE_FORMAT(r.start_time, '%Y-%m-%d %H:%i:%s') as start_time_formatted,
        rs.click_count
    FROM
        replay r
    JOIN
        replay_summary rs ON r.replay_id = rs.replay_id
    ORDER BY
        r.start_time ASC;
  `,
  listReplays: `
    SELECT 
        replay_id, 
        DATE_FORMAT(start_time, '%Y-%m-%d %H:%i:%s') as start_time_formatted 
    FROM replay 
    ORDER BY start_time DESC;
  `,
  listWebstateHashes: `
    SELECT html_hash FROM webstate ORDER BY html_hash;
  `,
  defaultUserQuery: `
    SELECT * FROM user;
  `,
  // --- Queries for save-replay.ts --- 
  insertSerializedNode: `
    INSERT INTO serialized_node (
      id, type, root_id, is_shadow_host, is_shadow,
      compat_mode, name, public_id, system_id,
      tag, is_svg, need_block, is_custom,
      text_content
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE type=VALUES(type);
  `,
  insertSerializedNodeAttribute: `
    INSERT INTO serialized_node_attribute (
      node_id, attribute_key, string_value, number_value, is_true, is_null
    ) VALUES (?, ?, ?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE string_value=VALUES(string_value), number_value=VALUES(number_value), is_true=VALUES(is_true), is_null=VALUES(is_null);
  `,
  linkSerializedNodeChild: `
    INSERT INTO serialized_node_child (parent_id, child_id) VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE child_id=VALUES(child_id);
  `,
  insertReplay: `
    INSERT INTO replay (
      replay_id, html_hash, start_time, end_time, product, product_version, device_type, os_type, os_version, network_id, 
      d_viewport_height, d_viewport_width
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,
  insertBaseEvent: `
    INSERT INTO event (event_id, replay_id, type, timestamp, delay) VALUES (?, ?, ?, ?, ?);
  `,
  insertMetaEvent: `
    INSERT INTO meta_event (event_id, href, width, height) VALUES (?, ?, ?, ?);
  `,
  insertFullSnapshotEvent: `
    INSERT INTO full_snapshot_event (event_id, node_id, initial_offset_top, initial_offset_left) VALUES (?, ?, ?, ?);
  `,
  insertIncrementalSnapshotEvent: `
    INSERT INTO incremental_snapshot_event (event_id, t) VALUES (?, ?);
  `,
  insertMouseInteractionData: `
    INSERT INTO mouse_interaction_data (
      event_id, interaction_type, node_id, x, y, pointer_type
    ) VALUES (?, ?, ?, ?, ?, ?);
  `,
  insertMouseMoveData: `
    INSERT INTO mousemove_data (event_id) VALUES (?);
  `,
  insertMousePosition: `
    INSERT INTO mouse_position (
      event_id, x, y, node_id, time_offset
    ) VALUES (?, ?, ?, ?, ?);
  `,
  insertScrollData: `
    INSERT INTO scroll_data (event_id, node_id, x, y) VALUES (?, ?, ?, ?);
  `,
  insertSelectionData: `
    INSERT INTO selection_data (event_id) VALUES (?);
  `,
  insertSelectionRange: `
    INSERT INTO selection_range (
      event_id, start, start_offset, end, end_offset
    ) VALUES (?, ?, ?, ?, ?);
  `,
  insertInputData: `
    INSERT INTO input_data (event_id, node_id, text, is_checked, user_triggered) VALUES (?, ?, ?, ?, ?);
  `,
  insertMediaInteractionData: `
    INSERT INTO media_interaction_data (
      event_id, interaction_type, node_id, time, volume, muted, isloop, playback_rate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `,
  insertViewportResizeData: `
    INSERT INTO viewport_resize_data (event_id, width, height) VALUES (?, ?, ?);
  `,
  insertMutationData: `
    INSERT INTO mutation_data (event_id, is_attach_iframe) VALUES (?, ?);
  `,
  insertTextMutation: `
    INSERT INTO text_mutation (event_id, node_id, value) VALUES (?, ?, ?);
  `,
  insertAttributeMutationBase: `
    INSERT INTO attribute_mutation (event_id, node_id) VALUES (?, ?) 
    ON DUPLICATE KEY UPDATE node_id=VALUES(node_id);
  `,
  insertAttributeMutationEntry: `
    INSERT INTO attribute_mutation_entry (event_id, node_id, attribute_key, string_value) VALUES (?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE string_value=VALUES(string_value);
  `,
  insertRemovedNodeMutation: `
    INSERT INTO removed_node_mutation (event_id, parent_id, node_id, is_shadow) VALUES (?, ?, ?, ?);
  `,
  insertAddedNodeMutation: `
    INSERT INTO added_node_mutation (event_id, parent_id, next_id, node_id) VALUES (?, ?, ?, ?);
  `,
  insertConsoleLog: `
    INSERT INTO console_log (
      log_id, replay_id, level, payload, delay, timestamp, trace
    ) VALUES (?, ?, ?, ?, ?, ?, ?);
  `,
  // --- Query for replay_clicks/[replay_id].ts --- 
  clicksPerSecondForReplay: `
    SELECT 
        DATE_FORMAT(e.timestamp, '%Y-%m-%d %H:%i:%s') as second, 
        COUNT(e.event_id) as count 
    FROM event e
    JOIN incremental_snapshot_event ise ON e.event_id = ise.event_id
    JOIN mouse_interaction_data mid ON ise.event_id = mid.event_id
    WHERE 
        e.replay_id = ? 
        AND ise.t = 'mouseinteraction' 
        AND mid.interaction_type = 'click'
    GROUP BY second
    ORDER BY second ASC;
  `
}; 