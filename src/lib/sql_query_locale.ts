import * as fs from 'node:fs';
import buildSchemaSqlContent from './build_schema.sql?raw'; // Use Vite's raw import


export const sqlQueries = {
  // webstate queries
  insertWebstateHash: 'insert into webstate (html_hash) values (?)',

  // user queries
  selectUserByEmailOrUsername: 'select 1 from user where (email_name = ? and email_domain = ?) or username = ? limit 1',
  insertUser: `insert into user (
    email_domain, email_name, username, password, 
    created_at, status, role, verified, fail_login, twofa
  ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  // Load the build schema query from the SQL file
  buildSchemaQuery: buildSchemaSqlContent,

  // Analysis queries
  countUsers: "select count(*) as count from user;",
  countWebstates: "select count(*) as count from webstate;",
  countReplays: "select count(*) as count from replay;",
  countEvents: "select count(*) as count from event;",
  eventsOverTime: "select date(timestamp) as date, count(event_id) as count from event group by date(timestamp) order by date asc;",
  clickEventsOverTime: `
    select 
        date(e.timestamp) as date, 
        count(e.event_id) as count 
    from event e
    join incremental_snapshot_event ise on e.event_id = ise.event_id
    join mouse_interaction_data mid on ise.event_id = mid.event_id
    where 
        ise.t = 'mouseinteraction' and mid.interaction_type = 'click'
    group by date(e.timestamp)
    order by date asc;
  `,
  clickEventsPerSecond: `
    select 
        date_format(e.timestamp, '%Y-%m-%d %H:%i:%s') as second, 
        count(e.event_id) as count 
    from event e
    join incremental_snapshot_event ise on e.event_id = ise.event_id
    join mouse_interaction_data mid on ise.event_id = mid.event_id
    where 
        ise.t = 'mouseinteraction' and mid.interaction_type = 'click'
    group by second
    order by second asc;
  `,
  clicksPerReplay: `
    select
        r.replay_id,
        date_format(r.start_time, '%Y-%m-%d %H:%i:%s') as start_time_formatted,
        rs.click_count
    from
        replay r
    join
        replay_summary rs on r.replay_id = rs.replay_id
    order by
        r.start_time asc;
  `,
  listReplays: `
    select 
        replay_id, 
        date_format(start_time, '%Y-%m-%d %H:%i:%s') as start_time_formatted 
    from replay 
    order by start_time desc;
  `,
  listWebstateHashes: `
    select html_hash from webstate order by html_hash;
  `,
  defaultUserQuery: `
    select * from user;
  `,
  // --- Query to get user role by email ---
  selectUserRoleByEmail: `
    select role from user where email_name = ? and email_domain = ? limit 1;
  `,
  // --- Queries for save-replay.ts --- 
  insertSerializedNode: `
    insert into serialized_node (
      id, type, root_id, is_shadow_host, is_shadow,
      compat_mode, name, public_id, system_id,
      tag, is_svg, need_block, is_custom,
      text_content
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
    on duplicate key update type=values(type);
  `,
  insertSerializedNodeAttribute: `
    insert into serialized_node_attribute (
      node_id, attribute_key, string_value, number_value, is_true, is_null
    ) values (?, ?, ?, ?, ?, ?) 
    on duplicate key update string_value=values(string_value), number_value=values(number_value), is_true=values(is_true), is_null=values(is_null);
  `,
  linkSerializedNodeChild: `
    insert into serialized_node_child (parent_id, child_id) values (?, ?) 
    on duplicate key update child_id=values(child_id);
  `,
  insertReplay: `
    insert into replay (
      replay_id, html_hash, start_time, end_time, product, product_version, device_type, os_type, os_version, network_id, 
      d_viewport_height, d_viewport_width
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,
  insertBaseEvent: `
    insert into event (event_id, replay_id, type, timestamp, delay) values (?, ?, ?, ?, ?);
  `,
  insertMetaEvent: `
    insert into meta_event (event_id, href, width, height) values (?, ?, ?, ?);
  `,
  insertFullSnapshotEvent: `
    insert into full_snapshot_event (event_id, node_id, initial_offset_top, initial_offset_left) values (?, ?, ?, ?);
  `,
  insertIncrementalSnapshotEvent: `
    insert into incremental_snapshot_event (event_id, t) values (?, ?);
  `,
  insertMouseInteractionData: `
    insert into mouse_interaction_data (
      event_id, interaction_type, node_id, x, y, pointer_type
    ) values (?, ?, ?, ?, ?, ?);
  `,
  insertMouseMoveData: `
    insert into mousemove_data (event_id) values (?);
  `,
  insertMousePosition: `
    insert into mouse_position (
      event_id, x, y, node_id, time_offset
    ) values (?, ?, ?, ?, ?);
  `,
  insertScrollData: `
    insert into scroll_data (event_id, node_id, x, y) values (?, ?, ?, ?);
  `,
  insertSelectionData: `
    insert into selection_data (event_id) values (?);
  `,
  insertSelectionRange: `
    insert into selection_range (
      event_id, start, start_offset, end, end_offset
    ) values (?, ?, ?, ?, ?);
  `,
  insertInputData: `
    insert into input_data (event_id, node_id, text, is_checked, user_triggered) values (?, ?, ?, ?, ?);
  `,
  insertMediaInteractionData: `
    insert into media_interaction_data (
      event_id, interaction_type, node_id, time, volume, muted, isloop, playback_rate
    ) values (?, ?, ?, ?, ?, ?, ?, ?);
  `,
  insertViewportResizeData: `
    insert into viewport_resize_data (event_id, width, height) values (?, ?, ?);
  `,
  insertMutationData: `
    insert into mutation_data (event_id, is_attach_iframe) values (?, ?);
  `,
  insertTextMutation: `
    insert into text_mutation (event_id, node_id, value) values (?, ?, ?);
  `,
  insertAttributeMutationBase: `
    insert into attribute_mutation (event_id, node_id) values (?, ?) 
    on duplicate key update node_id=values(node_id);
  `,
  insertAttributeMutationEntry: `
    insert into attribute_mutation_entry (event_id, node_id, attribute_key, string_value) values (?, ?, ?, ?) 
    on duplicate key update string_value=values(string_value);
  `,
  insertRemovedNodeMutation: `
    insert into removed_node_mutation (event_id, parent_id, node_id, is_shadow) values (?, ?, ?, ?);
  `,
  insertAddedNodeMutation: `
    insert into added_node_mutation (event_id, parent_id, next_id, node_id) values (?, ?, ?, ?);
  `,
  insertConsoleLog: `
    insert into console_log (
      log_id, replay_id, level, payload, delay, timestamp, trace
    ) values (?, ?, ?, ?, ?, ?, ?);
  `,
  // --- Query for replay_clicks/[replay_id].ts --- 
  clicksPerSecondForReplay: `
    select 
        date_format(e.timestamp, '%Y-%m-%d %H:%i:%s') as second, 
        count(e.event_id) as count 
    from event e
    join incremental_snapshot_event ise on e.event_id = ise.event_id
    join mouse_interaction_data mid on ise.event_id = mid.event_id
    where 
        e.replay_id = ? 
        and ise.t = 'mouseinteraction' 
        and mid.interaction_type = 'click'
    group by second
    order by second asc;
  `,
  // --- Query for replay_events/[replay_id].ts --- 
  eventsPerSecondForReplay: `
    select 
        date_format(e.timestamp, '%Y-%m-%d %H:%i:%s') as second, 
        count(e.event_id) as count 
    from event e
    join incremental_snapshot_event ise on e.event_id = ise.event_id
    where 
        e.replay_id = ? 
    group by second
    order by second asc;
  `,
  // --- Query for reports.astro --- 
  listMonthlyReports: `
    select 
      report_id, 
      report_month_start, 
      report_month_end,
      generated_at,
      new_users_count,
      new_webstates_count,
      new_replays_count,
      new_events_count,
      total_users_end,
      total_webstates_end,
      total_replays_end,
      total_events_end
    from monthly_reports
    order by report_month_start desc;
  `,
  // --- Queries for user settings --- 
  getUserPrivacyMask: `
    select privacy_mask from user where email_domain = ? and email_name = ? limit 1;
  `,
  updateUserPrivacyMask: `
    update user set privacy_mask = ? where email_domain = ? and email_name = ?;
  `,
  // --- Queries for password change --- 
  getUserPasswordHash: `
    select password from user where email_domain = ? and email_name = ? limit 1;
  `,
  updateUserPasswordHash: `
    update user set password = ? where email_domain = ? and email_name = ?;
  `,
  // --- Query for display name change --- 
  updateUsernameByEmail: `
    update user set username = ? where email_domain = ? and email_name = ?;
  `,
  // --- Query for network request logs --- 
  insertNetworkRequest: `
    insert into network_request (
      request_log_id, replay_id, request_session_id, url, method, status_code, 
      status_text, request_type, initiator_type, start_time_offset, 
      end_time_offset, duration_ms, absolute_timestamp, request_headers, 
      response_headers, response_size_bytes, performance_data, 
      is_fetch_complete, is_perf_complete
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `,
  // --- Query for dashboard --- 
  listRecentReplays: `
    select 
        replay_id, 
        date_format(start_time, '%Y-%m-%d %H:%i:%s') as start_time_formatted 
    from replay 
    order by start_time desc
    limit 5;
  `,
  getLatestMonthlyReport: `
    select 
      report_month_start, 
      new_users_count, 
      new_replays_count,
      total_users_end,
      total_replays_end,
      generated_at
    from monthly_reports 
    order by report_month_start desc
    limit 1;
  `,
  listRecentWebstates: `
    select html_hash 
    from webstate 
    order by created_at desc
    limit 5;
  `
}; 