drop database if exists caretdb;
create database caretdb;
use caretdb;

create table user (
    -- user_id char(32) primary key, -- removed
    email_domain varchar(255) not null check (
        email_domain regexp '^[a-za-z0-9\\.\\!\\#\\$\\%\\&\\*\\+\\/\\=\\\?\\^\\_\\`\\{\\|\\}\\\~\\-]+$'
    ), -- https://en.wikipedia.org/wiki/email_address#domain
    email_name varchar(64) not null check (
        email_name regexp "^[a-za-z0-9!#$%&'*+/=?^_`{|}~-]+(\\.[a-za-z0-9!#$%&'*+/=?^_`{|}~-]+)*(\\+[a-za-z0-9-]+)?$"
    ), -- https://en.wikipedia.org/wiki/email_address#local-part
    username varchar(64) check (
        username regexp "^(?=.*[a-za-z])[a-z0-9_\\-\\.']{3,30}$" and
        username not in ('admin', 'root', 'system', 'administrator')
    ), -- https://support.google.com/a/answer/9193374?hl=en
    password varchar(4096) check (
        length(password) >= 6
    ), -- https://cloud.google.com/identity-platform/docs/password-policy
    created_at timestamp not null,
    last_login timestamp,
    status varchar(16) check (
        status in ('enabled', 'disabled')
    ),
    first_name varchar(128),
    middle_name varchar(128),
    last_name varchar(128),
    phone_num char(11),
    role varchar(16) check (
        role in ('user', 'admin')
    ),
    verified boolean not null default false,
    fail_login int not null default 0 check (
        fail_login >= 0
    ),
    twofa boolean not null default false,
    privacy_mask boolean not null default true, -- Added for input masking preference
    primary key (email_name, email_domain), -- primary key
    unique key uk_user_email (email_domain, email_name) -- added unique key for fk constraint
);

create table webstate (
    created_at timestamp not null default current_timestamp, -- Added timestamp
    html_hash char(64) primary key check (
        html_hash regexp '^[a-f0-9]{64}$'
    ),
    email_domain varchar(255),
    email_name varchar(64),
    constraint fk_webstate_user foreign key (email_domain, email_name) references user(email_domain, email_name) -- added fk
);

-- Add index for created_at for faster report generation
create index idx_webstate_created_at on webstate(created_at);

create table replay (
    replay_id char(36) primary key, -- 123e4567-e89b-12d3-a456-426614174000
    html_hash char(64) not null, -- added html_hash
    start_time timestamp not null, -- 2024-03-29 10:00:00
    end_time timestamp not null, -- 2024-03-30 10:00:00
    product varchar(24) check (
        product in ('chrome', 'mozilla', 'applewebkit', 'safari', 'edge')
    ), -- chrome mozilla applewebkit
    product_version varchar(24) check (
        product_version regexp '^[0-9]+(\\.[0-9]+)*$'
    ), -- 91.0.4472.124  5.0  537.36 
    comment varchar(255),  -- this recording is about ... 
    device_type varchar(24) check (
        device_type in ('desktop', 'mobile', 'tablet', 'unknown') -- added tablet based on api logic
    ), -- x
    os_type varchar(24) check (
        os_type in ('windows nt', 'macintosh', 'linux', 'ios', 'android')
    ), -- macintosh; intel mac os x; u; en
    os_version varchar(16) check (
        os_version regexp '^[0-9]+(_[0-9]+)*(\\.?[0-9]+)*$'
    ), -- 13_5_1 10.0 https://developer.mozilla.org/en-us/docs/web/http/reference/headers/user-agent#chrome_ua_string
    -- user_id char(32) not null, -- removed user_id
    network_id varchar(15) check (
        network_id regexp '^[0-9]{1,3}(\\.[0-9]{1,3}){3}$'
    ), -- 183.30.196.133 422.225.101.242
    host_id varchar(4096) check (
        host_id regexp '^[a-za-z0-9-]+(\\.[a-za-z0-9-]+)+$'
    ), -- fonts.googleapis.com huggingface.co
    d_viewport_height int, -- 1 1320 1680
    d_viewport_width int, -- 1 1920 2560
    constraint correct_times check (
        start_time <= end_time
    ),
    constraint chk_viewport_height check (
        d_viewport_height > 0
    ),
    constraint chk_viewport_width check (
        d_viewport_width > 0
    ),
    constraint fk_replay_webstate foreign key (html_hash) references webstate(html_hash) -- added fk
    -- constraint fk_replay_user foreign key (user_id) references user(user_id) -- removed fk
);
-- #######################################################################
-- this is superceded by different types of elements in rrweb
-- #######################################################################
-- create table element (
--     uid char(32) primary key check (
--         uid regexp '^[a-f0-9]{32}$'
--     ),
--     html_hash char(64),
--     tag varchar(24),
--     xpath varchar(255), -- path/to/element
--     text varchar(4096), -- some text inside the element
--     xpos int check (xpos >= 0),
--     ypos int check (ypos >= 0),
--     height int check (height > 0),
--     width int check (width > 0),
--     z_index int default 0,
--     foreign key (html_hash) references webstate(html_hash)
-- );
-- -- also used in rrweb but follow definition used there
-- create table element_attributes (
--     uid char(32),
--     html_hash char(64),
--     attribute varchar(100),
--     primary key (uid, html_hash, attribute),
--     foreign key (uid) references element(uid),
--     foreign key (html_hash) references webstate(html_hash)
-- );


-- combined relation because it would be a pain to retrieve nodes otherwise.
-- 1. serialized nodes
create table serialized_node (
  id               int                primary key,
  type             enum (
    'document','documenttype','element','text','cdata','comment'
    )          not null,
  root_id          int,                             
  is_shadow_host   boolean            not null default false,
  is_shadow        boolean            not null default false,

  -- document‐specific
  compat_mode      text,
  name             text,
  public_id        text,
  system_id        text,

  -- element‐specific
  tag              varchar(24),
  is_svg           boolean            not null default false,
  need_block       boolean            not null default false,
  is_custom        boolean            not null default false,

  -- text/cdata/comment
  text_content     text
);

-- 2a. element child nodes (document+element)
create table serialized_node_child (
  parent_id int not null references serialized_node(id),
  child_id  int not null references serialized_node(id),
  primary key (parent_id, child_id)
);

-- 2b. element attributes (string|number|true|null)
create table serialized_node_attribute (
  node_id      int     not null references serialized_node(id),
  attribute_key varchar(32)   not null,
  string_value text,
  number_value numeric,
  is_true      boolean not null default false,
  is_null      boolean not null default false,
  primary key (node_id, attribute_key)
);


-- 3. style-om values (for any styleomvalue usage)
create table style_om_value (
  id int auto_increment primary key
);

create table style_om_value_entry (
  id                 int,
  property           char(32)   not null,
  value_string       text,
  priority           text,
  primary key (id, property)
);


-- 4. events
create table event (
  event_id   char(36)       primary key,
  replay_id  char(36)       not null, -- added replay_id
  type       enum('fullsnapshot','incrementalsnapshot','meta')   not null,
  timestamp  timestamp       not null,
  delay      int,
  constraint fk_event_replay foreign key (replay_id) references replay(replay_id) -- added fk
);

-- fullsnapshot
create table full_snapshot_event (
  event_id            char(36) primary key references event(event_id),
  node_id             int not null references serialized_node(id),
  initial_offset_top  int not null,
  initial_offset_left int not null
);

-- meta
create table meta_event (
  event_id char(36) primary key references event(event_id),
  href      text   not null,
  width     int    not null,
  height    int    not null
);

-- incrementalsnapshot
-- drop table if exists incremental_data; -- no longer needed

-- removed incremental_data table definition

create table incremental_snapshot_event (
  event_id            char(36) primary key references event(event_id),
  -- incremental_data_id char(36) not null references incremental_data(id) -- removed
  t  enum (  -- renamed from source and moved here
    'mutation','mousemove','mouseinteraction','scroll','viewportresize',
    'input','touchmove','mediainteraction','stylesheetrule',
    'canvasmutation','font','log','drag','styledeclaration','selection',
    'adoptedstylesheet','customelement'
    )  not null
);


-- 5. mutation data & child tables
create table mutation_data (
  -- id               char(36)  primary key references incremental_data(id), -- changed pk and fk
  event_id         char(36)  primary key references incremental_snapshot_event(event_id),
  is_attach_iframe boolean not null default false
);

-- texts[]
create table text_mutation (
  -- mutation_data_id char(36)    not null references mutation_data(id), -- changed fk
  event_id         char(36)    not null references mutation_data(event_id),
  node_id          int    not null,
  value            text,
  primary key (event_id, node_id) -- changed pk
);

-- attributes[]
create table attribute_mutation (
  -- mutation_data_id char(36)    not null references mutation_data(id), -- changed fk
  event_id         char(36)    not null references mutation_data(event_id),
  node_id          int    not null,
  primary key (event_id, node_id) -- changed pk
);

create table attribute_mutation_entry (
  -- mutation_data_id char(36)    not null, -- changed target table in fk below
  event_id         char(36)    not null,
  node_id          int    not null,
  attribute_key    char(32)   not null,
  string_value     text,
  style_om_value_id int references style_om_value(id),
  primary key (event_id, node_id, attribute_key), -- changed pk
  foreign key (event_id, node_id) references attribute_mutation(event_id, node_id) -- changed fk
);

-- removes[]
create table removed_node_mutation (
  -- mutation_data_id char(36)    not null references mutation_data(id), -- changed fk
  event_id         char(36)    not null references mutation_data(event_id),
  parent_id        int    not null,
  node_id          int    not null,
  is_shadow        boolean not null default false,
  primary key (event_id, node_id) -- changed pk
);

-- adds[]
create table added_node_mutation (
  -- mutation_data_id char(36)    not null references mutation_data(id), -- changed fk
  event_id         char(36)    not null references mutation_data(event_id),
  parent_id        int    not null,
  next_id          int,
  node_id          int    not null references serialized_node(id),
  primary key (event_id, parent_id, node_id) -- primary key remains the same
);


-- 6. mousemove / touchmove / drag
create table mousemove_data (
  -- id char(36) primary key references incremental_data(id) -- changed pk and fk
  event_id char(36) primary key references incremental_snapshot_event(event_id)
);

create table mouse_position (
  -- mousemove_data_id char(36) not null references mousemove_data(id), -- changed fk
  event_id          char(36) not null references mousemove_data(event_id),
  x                 int not null,
  y                 int not null,
  node_id           int not null,
  time_offset       int not null,
  primary key (event_id, node_id, time_offset) -- changed pk
);


-- 7. mouse interactions
create table mouse_interaction_data (
  -- id               char(36)               primary key references incremental_data(id), -- changed pk and fk
  event_id         char(36)               primary key references incremental_snapshot_event(event_id),
  interaction_type enum (
    'mouseup','mousedown','click','contextmenu','dblclick',
    'focus','blur','touchstart','touchmove_departed','touchend','touchcancel'
    ) not null,
  node_id          int               not null,
  x                int,
  y                int,
  pointer_type     enum ('mouse','pen','touch')
);


-- 8. scroll
create table scroll_data (
  -- id      char(36) primary key references incremental_data(id), -- changed pk and fk
  event_id char(36) primary key references incremental_snapshot_event(event_id),
  node_id int not null,
  x       int not null,
  y       int not null
);


-- 9. viewport resize
create table viewport_resize_data (
  -- id     char(36) primary key references incremental_data(id), -- changed pk and fk
  event_id char(36) primary key references incremental_snapshot_event(event_id),
  width  int not null,
  height int not null
);


-- 10. input
create table input_data (
  -- id             char(36)     primary key references incremental_data(id), -- changed pk and fk
  event_id       char(36)     primary key references incremental_snapshot_event(event_id),
  node_id        int     not null,
  text           text    not null,
  is_checked     boolean not null,
  user_triggered boolean not null default false
);


-- 11. media interactions
create table media_interaction_data (
  -- id               char(36)    primary key references incremental_data(id), -- changed pk and fk
  event_id         char(36)    primary key references incremental_snapshot_event(event_id),
  interaction_type  enum(
    'play','pause','seeked','volumechange','ratechange'
    ) not null,
  node_id          int     not null,
  time             decimal(8,4),
  volume           decimal(8,4),
  muted            boolean,
  isloop             boolean,
  playback_rate    decimal(8,4)
);


-- 15. font
create table font_data (
  -- id          char(36)  primary key references incremental_data(id), -- changed pk and fk
  event_id    char(36)  primary key references incremental_snapshot_event(event_id),
  family      text not null,
  font_source text not null,
  buffer      boolean not null
);

create table font_descriptor (
  id               serial primary key,
  -- font_data_id char(36)    not null references font_data(id), -- changed fk
  event_id         char(36)    not null references font_data(event_id),
  descriptor_key   text  not null,
  descriptor_value text  not null
);


-- 16. selection
create table selection_data (
  -- id char(36) primary key references incremental_data(id) -- changed pk and fk
  event_id char(36) primary key references incremental_snapshot_event(event_id)
);

create table selection_range (
  id               serial primary key,
  -- selection_data_id char(36)   not null references selection_data(id), -- changed fk
  event_id         char(36)   not null references selection_data(event_id),
  start            int    not null,
  start_offset     int    not null,
  end              int    not null,
  end_offset       int    not null
);

-- 17. console logs (new table)
create table console_log (
  log_id     char(36) primary key,          -- uuid for the log entry
  replay_id  char(36) not null,             -- fk to the replay session
  level      enum('log', 'warn', 'error', 'info', 'debug') not null, -- console level
  payload    json not null,                 -- arguments passed to console function (json array)
  delay      int not null,                  -- milliseconds delay from recording start
  timestamp  timestamp not null,            -- absolute timestamp
  trace      text null,                     -- optional stack trace for errors
  constraint fk_console_log_replay foreign key (replay_id) references replay(replay_id)
);

-- we also need to store network and console shoot. should have multitasked that ah whatever
create table cookie (
    name varchar(256),
    html_hash char(64),
    path varchar(256) check (
        path regexp '^/.*' and
        length(path) <= 256
    ), -- minify if exceed 256
    secure boolean not null default false,
    http_only boolean not null default false,
    size int check (size between 1 and 4096),
    expiry timestamp,
    domain varchar(4096) check (
        domain regexp '^[a-za-z0-9-]+(\\.[a-za-z0-9-]+)+$'
    ),
    value varchar(4096),
    same_site varchar(20) check (
        same_site in ('strict', 'lax', 'none')
    ),
    last_accessed timestamp,
    primary key (name, html_hash),
    foreign key (html_hash) references webstate(html_hash)
); -- https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis

insert into user (email_domain, email_name, username, password, created_at, last_login, status, first_name, middle_name, last_name, phone_num, role, verified, fail_login, twofa)
values ('gmail.com','picokatx','theo','3a4b52fc88795615c55066100afbba60bea938b976fd40f13def78369a209f50','2024-02-05 07:30:25','2024-05-29 02:45:55','enabled','theo','weibin','1','1832555445','user',1,0,1);
insert into webstate (html_hash, email_domain, email_name) values ('f62b9ab27ca98a242428f2c49b0b69d09af6568f9b83bf35cc6bf529312c3013', 'gmail.com', 'picokatx');

-- #######################################################################
-- aggregation tables for analysis
-- #######################################################################

/* -- Removed heatmap/scroll summary tables for simplification
-- summary table for click heatmap data
create table page_click_heatmap_summary (
    html_hash char(64) not null,
    bin_x int not null,         -- x-coordinate bin (e.g., floor(x / 10))
    bin_y int not null,         -- y-coordinate bin (e.g., floor(y / 10))
    click_count int not null default 0,
    last_updated timestamp default current_timestamp on update current_timestamp,
    primary key (html_hash, bin_x, bin_y),
    constraint fk_click_heatmap_webstate foreign key (html_hash) references webstate(html_hash) on delete cascade
);

-- summary table for mouse movement heatmap data (simplified: counts positions)
-- note: aggregating raw mousemove paths into density can be complex.
-- this stores counts per position bin for simplicity.
create table page_movement_heatmap_summary (
    html_hash char(64) not null,
    bin_x int not null,         -- x-coordinate bin
    bin_y int not null,         -- y-coordinate bin
    position_count int not null default 0, -- count of times mouse was in this bin
    last_updated timestamp default current_timestamp on update current_timestamp,
    primary key (html_hash, bin_x, bin_y),
    constraint fk_movement_heatmap_webstate foreign key (html_hash) references webstate(html_hash) on delete cascade
);

-- summary table for scroll depth data (stores max depth reached per session)
-- calculating percentage requires page height, which can vary. storing max pixel depth is simpler.
create table page_scroll_depth_summary (
    html_hash char(64) not null,
    replay_id char(36) not null, -- store per replay initially for potential detailed analysis
    max_scroll_y int not null default 0, -- max y pixel scrolled to in this replay
    last_updated timestamp default current_timestamp on update current_timestamp,
    primary key (html_hash, replay_id),
    constraint fk_scroll_depth_webstate foreign key (html_hash) references webstate(html_hash) on delete cascade,
    constraint fk_scroll_depth_replay foreign key (replay_id) references replay(replay_id) on delete cascade
);
*/

-- New summary table for clicks per replay session
create table replay_summary (
    replay_id char(36) not null primary key,
    html_hash char(64) not null,
    click_count int not null default 0,
    last_updated timestamp default current_timestamp on update current_timestamp,
    constraint fk_replay_summary_replay foreign key (replay_id) references replay(replay_id) on delete cascade,
    constraint fk_replay_summary_webstate foreign key (html_hash) references webstate(html_hash) on delete cascade
);


-- #######################################################################
-- stored procedure for updating analysis summaries (Simplified)
-- #######################################################################

-- Drop existing procedure if it exists
drop procedure if exists update_analysis_summaries;

-- Recreate procedure to update replay_summary table
create procedure update_analysis_summaries(in p_replay_id char(36), in p_html_hash char(64))
begin
    declare v_click_count int default 0;

    -- Calculate clicks for the given replay
    select count(*)
    into v_click_count
    from event e
    join incremental_snapshot_event ise on e.event_id = ise.event_id
    join mouse_interaction_data mid on ise.event_id = mid.event_id
    where e.replay_id = p_replay_id
      and ise.t = 'mouseinteraction'
      and mid.interaction_type = 'click';

    -- Insert or update the click count for the specific replay
    insert into replay_summary (replay_id, html_hash, click_count)
    values (p_replay_id, p_html_hash, v_click_count)
    on duplicate key update
        click_count = values(click_count), -- Ensure the count is updated if re-run
        last_updated = current_timestamp; 

end;


-- #######################################################################
-- trigger to call the stored procedure after replay insert
-- #######################################################################
/* -- Trigger removed due to timing issues. Call procedure from application logic.
create trigger after_replay_insert
after insert on replay
for each row
begin
    call update_analysis_summaries(new.replay_id, new.html_hash);
end;
*/

-- #######################################################################
-- Monthly Reporting Functionality
-- #######################################################################

-- Table to store monthly report data
drop table if exists monthly_reports;
create table monthly_reports (
    report_id int auto_increment primary key,
    report_month_start date not null,
    report_month_end date not null,
    generated_at timestamp not null default current_timestamp,
    new_users_count int unsigned not null default 0,
    new_webstates_count int unsigned not null default 0,
    new_replays_count int unsigned not null default 0,
    new_events_count bigint unsigned not null default 0, -- Can be large
    total_users_end int unsigned not null default 0,
    total_webstates_end int unsigned not null default 0,
    total_replays_end int unsigned not null default 0,
    total_events_end bigint unsigned not null default 0,
    unique key uk_report_month (report_month_start) -- Ensure only one report per month start
);

-- Procedure to generate the report for the PREVIOUS month
drop procedure if exists generate_monthly_report;

create procedure generate_monthly_report()
begin
    declare v_report_month_start date;
    declare v_report_month_end date;
    declare v_new_users int unsigned default 0;
    declare v_new_webstates int unsigned default 0;
    declare v_new_replays int unsigned default 0;
    declare v_new_events bigint unsigned default 0;
    declare v_total_users int unsigned default 0;
    declare v_total_webstates int unsigned default 0;
    declare v_total_replays int unsigned default 0;
    declare v_total_events bigint unsigned default 0;

    -- Calculate start and end dates for the *previous* full month
    set v_report_month_end = last_day(now() - interval 1 month);
    set v_report_month_start = date_format(v_report_month_end, '%Y-%m-01');

    -- Check if report for this period already exists
    if not exists (select 1 from monthly_reports where report_month_start = v_report_month_start) then

        -- Calculate 'new' counts for the period
        select count(*) into v_new_users from user where created_at between v_report_month_start and v_report_month_end + interval 1 day - interval 1 second;
        select count(*) into v_new_webstates from webstate where created_at between v_report_month_start and v_report_month_end + interval 1 day - interval 1 second;
        select count(*) into v_new_replays from replay where start_time between v_report_month_start and v_report_month_end + interval 1 day - interval 1 second;
        select count(*) into v_new_events from event where timestamp between v_report_month_start and v_report_month_end + interval 1 day - interval 1 second;

        -- Calculate 'total' counts at the time of report generation (or end of period)
        select count(*) into v_total_users from user;
        select count(*) into v_total_webstates from webstate;
        select count(*) into v_total_replays from replay;
        select count(*) into v_total_events from event;

        -- Insert the report data
        insert into monthly_reports (
            report_month_start, report_month_end,
            new_users_count, new_webstates_count, new_replays_count, new_events_count,
            total_users_end, total_webstates_end, total_replays_end, total_events_end
        ) values (
            v_report_month_start, v_report_month_end,
            v_new_users, v_new_webstates, v_new_replays, v_new_events,
            v_total_users, v_total_webstates, v_total_replays, v_total_events
        );

    end if;
end;
-- #######################################################################
-- Monthly Report Scheduler Event
-- #######################################################################

-- Note: MySQL Event Scheduler must be enabled on the server!
-- Execute `SET GLOBAL event_scheduler = ON;` or configure it in my.cnf/my.ini

drop event if exists monthly_report_scheduler;
create event monthly_report_scheduler
on schedule every 1 month
starts date_format(now() + interval 1 month, '%Y-%m-02 02:00:00') -- Run on the 2nd day of the month at 2 AM
do
begin
    call generate_monthly_report();
end;

-- #######################################################################
-- Privacy Mask Trigger
-- #######################################################################

drop trigger if exists before_input_data_insert_mask;

-- Trigger to mask input text before insertion based on user preference
-- WARNING: This involves joins and might impact insert performance significantly.
-- Consider application-level filtering if performance is critical.
create trigger before_input_data_insert_mask
before insert on input_data
for each row
begin
    -- set new.text = repeat('*', length(new.text));

    declare v_user_privacy_mask boolean default true; -- Default to mask if user not found (shouldn't happen with FKs)
    declare v_replay_id char(36);
    declare v_html_hash char(64);
    declare v_email_domain varchar(255);
    declare v_email_name varchar(64);

    -- 1. Get replay_id from event
    select replay_id into v_replay_id from event where event_id = new.event_id limit 1;

    if v_replay_id is not null then
        -- 2. Get html_hash from replay
        select html_hash into v_html_hash from replay where replay_id = v_replay_id limit 1;

        if v_html_hash is not null then
            -- 3. Get user email from webstate
            select email_domain, email_name into v_email_domain, v_email_name from webstate where html_hash = v_html_hash limit 1;

            if v_email_domain is not null and v_email_name is not null then
                -- 4. Get the user's privacy setting
                select privacy_mask into v_user_privacy_mask from user where email_domain = v_email_domain and email_name = v_email_name limit 1;
            end if;
        end if;
    end if;

    -- 5. Mask the text if the user setting is true
    if v_user_privacy_mask = true then
        set new.text = repeat('*', length(new.text));
    end if;

end;