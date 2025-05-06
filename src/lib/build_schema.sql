drop database if exists caretdb;
create database caretdb;
use caretdb;

create table user (
    email_domain varchar(255) not null check (
        email_domain regexp '^[a-za-z0-9\\.\\!\\#\\$\\%\\&\\*\\+\\/\\=\\\?\\^\\_\\`\\{\\|\\}\\\~\\-]+$'
    ), 
    email_name varchar(64) not null check (
        email_name regexp "^[a-za-z0-9!#$%&'*+/=?^_`{|}~-]+(\\.[a-za-z0-9!#$%&'*+/=?^_`{|}~-]+)*(\\+[a-za-z0-9-]+)?$"
    ), 
    username varchar(64) check (
        username regexp "^(?=.*[a-za-z])[a-z0-9_\\-\\.']{3,30}$" and
        username not in ('admin', 'root', 'system', 'administrator')
    ), 
    password varchar(4096) check (
        length(password) >= 6
    ), 
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
    privacy_mask boolean not null default true, 
    primary key (email_name, email_domain), 
    unique key uk_user_email (email_domain, email_name) 
);

create table webstate (
    created_at timestamp not null default current_timestamp, 
    html_hash char(64) primary key check (
        html_hash regexp '^[a-f0-9]{64}$'
    ),
    email_domain varchar(255),
    email_name varchar(64),
    constraint fk_webstate_user foreign key (email_domain, email_name) references user(email_domain, email_name) 
);

create index idx_webstate_created_at on webstate(created_at);

create table replay (
    replay_id char(36) primary key, 
    html_hash char(64) not null, 
    start_time timestamp not null, 
    end_time timestamp not null, 
    product varchar(24) check (
        product in ('chrome', 'mozilla', 'applewebkit', 'safari', 'edge')
    ), 
    product_version varchar(24) check (
        product_version regexp '^[0-9]+(\\.[0-9]+)*$'
    ), 
    comment varchar(255),  
    device_type varchar(24) check (
        device_type in ('desktop', 'mobile', 'tablet', 'unknown') 
    ), 
    os_type varchar(24) check (
        os_type in ('windows nt', 'macintosh', 'linux', 'ios', 'android')
    ), 
    os_version varchar(16) check (
        os_version regexp '^[0-9]+(_[0-9]+)*(\\.?[0-9]+)*$'
    ), 
    network_id varchar(15) check (
        network_id regexp '^[0-9]{1,3}(\\.[0-9]{1,3}){3}$'
    ), 
    host_id varchar(4096) check (
        host_id regexp '^[a-za-z0-9-]+(\\.[a-za-z0-9-]+)+$'
    ), 
    d_viewport_height int, 
    d_viewport_width int, 
    constraint correct_times check (
        start_time <= end_time
    ),
    constraint chk_viewport_height check (
        d_viewport_height > 0
    ),
    constraint chk_viewport_width check (
        d_viewport_width > 0
    ),
    constraint fk_replay_webstate foreign key (html_hash) references webstate(html_hash) 
);

create table serialized_node (
  id               int                primary key,
  type             enum (
    'document','documenttype','element','text','cdata','comment'
    )          not null,
  root_id          int,                             
  is_shadow_host   boolean            not null default false,
  is_shadow        boolean            not null default false,


   compat_mode      varchar(255),
  name             varchar(255),
  public_id        varchar(255),
  system_id        varchar(255),

  tag              varchar(24),
  is_svg           boolean            not null default false,
  need_block       boolean            not null default false,
  is_custom        boolean            not null default false,

  text_content     text
);

create table serialized_node_child (
  parent_id int not null references serialized_node(id),
  child_id  int not null references serialized_node(id),

  primary key (parent_id, child_id),
  constraint fk_serialized_node_child_child_id foreign key (child_id) references serialized_node(id) on delete cascade,
  constraint fk_serialized_node_child_parent_id foreign key (parent_id) references serialized_node(id) on delete cascade
);

create table serialized_node_attribute (
  node_id      int     not null,
  attribute_key varchar(32)   not null,
  string_value text,
  number_value numeric,
  is_true      boolean not null default false,
  is_null      boolean not null default false,

  primary key (node_id, attribute_key),
  constraint fk_serialized_node_attribute_node_id foreign key (node_id) references serialized_node(id) on delete cascade
);

create table style_om_value (
  id int auto_increment primary key
);

create table style_om_value_entry (
  id                 int,
  property           char(32)   not null,
  value_string       varchar(255),
  priority           varchar(255),
  primary key (id, property)
);

create table event (
  event_id   char(36)       primary key,
  replay_id  char(36)       not null, 
  type       enum('fullsnapshot','incrementalsnapshot','meta')   not null,
  timestamp  timestamp       not null,
  delay      int,

  constraint fk_event_replay foreign key (replay_id) references replay(replay_id) 
);

create table full_snapshot_event (
  event_id            char(36) primary key,
  node_id             int not null,
  initial_offset_top  int not null,
  initial_offset_left int not null,

  constraint fk_full_snapshot_event_event_id foreign key (event_id) references event(event_id) on delete cascade,
  constraint fk_full_snapshot_event_node_id foreign key (node_id) references serialized_node(id) on delete cascade
);

create table meta_event (
  event_id char(36) primary key,
  href      text   not null,
  width     int    not null,
  height    int    not null,

  constraint fk_meta_event_event_id foreign key (event_id) references event(event_id) on delete cascade
);

create table incremental_snapshot_event (
  event_id            char(36) primary key,
  t  enum (  
    'mutation','mousemove','mouseinteraction','scroll','viewportresize',
    'input','touchmove','mediainteraction','stylesheetrule',
    'canvasmutation','font','log','drag','styledeclaration','selection',
    'adoptedstylesheet','customelement'
    )  not null,

  constraint fk_incremental_snapshot_event_event_id foreign key (event_id) references event(event_id) on delete cascade
);

create table mutation_data (
  event_id         char(36)  primary key,
  is_attach_iframe boolean not null default false,

  constraint fk_mutation_data_event_id foreign key (event_id) references incremental_snapshot_event(event_id) on delete cascade
);

create table text_mutation (
  event_id         char(36)    not null,
  node_id          int    not null,
  value            text,
  primary key (event_id, node_id),
  constraint fk_text_mutation_event_id foreign key (event_id) references mutation_data(event_id) on delete cascade
);

create table attribute_mutation (
  event_id         char(36)    not null,
  node_id          int    not null,

  primary key (event_id, node_id),
  constraint fk_attribute_mutation_event_id foreign key (event_id) references mutation_data(event_id) on delete cascade
);

create table attribute_mutation_entry (
  event_id         char(36)    not null,
  node_id          int    not null,
  attribute_key    char(32)   not null,
  string_value     text,
  style_om_value_id int,

  primary key (event_id, node_id, attribute_key), 
  constraint fk_attribute_mutation_entry_event_id_node_id foreign key (event_id, node_id) references attribute_mutation(event_id, node_id) on delete cascade,
  constraint fk_attribute_mutation_entry_style_om_value_id foreign key (style_om_value_id) references style_om_value(id) on delete set null
);

create table removed_node_mutation (
  event_id         char(36)    not null,
  parent_id        int    not null,
  node_id          int    not null,
  is_shadow        boolean not null default false,

  primary key (event_id, node_id),
  constraint fk_removed_node_mutation_node_id foreign key (event_id) references mutation_data(event_id) on delete cascade
);

create table added_node_mutation (
  event_id         char(36)    not null,
  parent_id        int    not null,
  next_id          int,
  node_id          int    not null references serialized_node(id),

  primary key (event_id, parent_id, node_id),
  constraint fk_added_node_mutation_event_id foreign key (event_id) references mutation_data(event_id) on delete cascade,
  constraint fk_added_node_mutation_node_id foreign key (node_id) references serialized_node(id) on delete cascade
);

create table mousemove_data (
  event_id char(36) primary key,

  constraint fk_mousemove_data_event_id foreign key (event_id) references incremental_snapshot_event(event_id) on delete cascade
);

create table mouse_position (
  event_id          char(36) not null,
  x                 int not null,
  y                 int not null,
  node_id           int not null,
  time_offset       int not null,

  primary key (event_id, node_id, time_offset),
  constraint fk_mouse_position_event_id foreign key (event_id) references mousemove_data(event_id) on delete cascade
);

create table mouse_interaction_data (
  event_id         char(36)               primary key,
  interaction_type enum (
    'mouseup','mousedown','click','contextmenu','dblclick',
    'focus','blur','touchstart','touchmove_departed','touchend','touchcancel'
    ) not null,
  node_id          int               not null,
  x                int,
  y                int,
  pointer_type     enum ('mouse','pen','touch'),

  constraint fk_mouse_interaction_data_event_id foreign key (event_id) references incremental_snapshot_event(event_id) on delete cascade
);

create table scroll_data (
  event_id char(36) primary key,
  node_id int not null,
  x       int not null,
  y       int not null,

  constraint fk_scroll_data_event_id foreign key (event_id) references incremental_snapshot_event(event_id) on delete cascade
);

create table viewport_resize_data (
  event_id char(36) primary key,
  width  int not null,
  height int not null,

  constraint fk_viewport_resize_data_event_id foreign key (event_id) references incremental_snapshot_event(event_id) on delete cascade
);

create table input_data (
  event_id       char(36)     primary key,
  node_id        int     not null,
  text           text    not null,
  is_checked     boolean not null,
  user_triggered boolean not null default false,

  constraint fk_input_data_event_id foreign key (event_id) references incremental_snapshot_event(event_id) on delete cascade
);

create table media_interaction_data (
  event_id         char(36)    primary key,
  interaction_type  enum(
    'play','pause','seeked','volumechange','ratechange'
    ) not null,
  node_id          int     not null,
  time             decimal(8,4),
  volume           decimal(8,4),
  muted            boolean,
  isloop             boolean,
  playback_rate    decimal(8,4),

  constraint fk_media_interaction_data_event_id foreign key (event_id) references incremental_snapshot_event(event_id) on delete cascade
);

create table font_data (
  event_id    char(36)  primary key,
  family      text not null,
  font_source text not null,
  buffer      boolean not null,

  constraint fk_font_data_event_id foreign key (event_id) references incremental_snapshot_event(event_id) on delete cascade
);

create table font_descriptor (
  id               serial primary key,
  event_id         char(36)    not null,
  descriptor_key   text  not null,
  descriptor_value text  not null,

  constraint fk_font_descriptor_event_id foreign key (event_id) references font_data(event_id) on delete cascade
);

create table selection_data (
  event_id char(36) primary key,

  constraint fk_selection_data_event_id foreign key (event_id) references incremental_snapshot_event(event_id) on delete cascade
);

create table selection_range (
  id               serial primary key,
  event_id         char(36)   not null,
  start            int    not null,
  start_offset     int    not null,
  end              int    not null,
  end_offset       int    not null,

  constraint fk_selection_range_event_id foreign key (event_id) references selection_data(event_id) on delete cascade
);

create table console_log (
  log_id     char(36) primary key,          
  replay_id  char(36) not null,             
  level      enum('log', 'warn', 'error', 'info', 'debug') not null, 
  payload    json not null,                 
  delay      int not null,                  
  timestamp  timestamp not null,            
  trace      text null,                     

  constraint fk_console_log_replay foreign key (replay_id) references replay(replay_id) on delete cascade
);

create table network_request (
    request_log_id char(36) primary key,        
    replay_id char(36) not null,                
    request_session_id varchar(64) not null,   
    url text not null,                          
    method varchar(16) not null,                
    status_code smallint unsigned null,         
    status_text varchar(255) null,              
    request_type varchar(32) null,              
    initiator_type varchar(32) null,           
    start_time_offset int unsigned not null,    
    end_time_offset int unsigned null,          
    duration_ms int unsigned null,              
    absolute_timestamp timestamp not null,      
    request_headers json null,                  
    response_headers json null,                 
    response_size_bytes int unsigned null,      
    performance_data json null,                 
    is_fetch_complete boolean null,             
    is_perf_complete boolean null,           

    constraint fk_network_request_replay foreign key (replay_id) references replay(replay_id) on delete cascade
);

create index idx_network_request_replay_id on network_request(replay_id);

create table cookie (
    name varchar(256),
    html_hash char(64),
    path varchar(256) check (
        path regexp '^/.*' and
        length(path) <= 256
    ), 
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
); 

create table replay_summary (
    replay_id char(36) not null primary key,
    html_hash char(64) not null,
    click_count int not null default 0,
    last_updated timestamp default current_timestamp on update current_timestamp,

    constraint fk_replay_summary_replay foreign key (replay_id) references replay(replay_id) on delete cascade,
    constraint fk_replay_summary_webstate foreign key (html_hash) references webstate(html_hash) on delete cascade
);

drop procedure if exists update_analysis_summaries;

create procedure update_analysis_summaries(in p_replay_id char(36), in p_html_hash char(64))
begin
    declare v_click_count int default 0;
    select count(*)
    into v_click_count
    from event e
    join incremental_snapshot_event ise on e.event_id = ise.event_id
    join mouse_interaction_data mid on ise.event_id = mid.event_id
    where e.replay_id = p_replay_id
      and ise.t = 'mouseinteraction'
      and mid.interaction_type = 'click';

    insert into replay_summary (replay_id, html_hash, click_count)
    values (p_replay_id, p_html_hash, v_click_count)
    on duplicate key update
        click_count = values(click_count), 
        last_updated = current_timestamp; 
end;

drop table if exists monthly_reports;
create table monthly_reports (
    report_id int auto_increment primary key,
    report_month_start date not null,
    report_month_end date not null,
    generated_at timestamp not null default current_timestamp,
    new_users_count int unsigned not null default 0,
    new_webstates_count int unsigned not null default 0,
    new_replays_count int unsigned not null default 0,
    new_events_count bigint unsigned not null default 0, 
    total_users_end int unsigned not null default 0,
    total_webstates_end int unsigned not null default 0,
    total_replays_end int unsigned not null default 0,
    total_events_end bigint unsigned not null default 0,
    unique key uk_report_month (report_month_start) 
);

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

    set v_report_month_end = last_day(now() - interval 1 month);
    set v_report_month_start = date_format(v_report_month_end, '%Y-%m-01');

    if not exists (select 1 from monthly_reports where report_month_start = v_report_month_start) then

        select count(*) into v_new_users from user where created_at between v_report_month_start and v_report_month_end + interval 1 day - interval 1 second;
        select count(*) into v_new_webstates from webstate where created_at between v_report_month_start and v_report_month_end + interval 1 day - interval 1 second;
        select count(*) into v_new_replays from replay where start_time between v_report_month_start and v_report_month_end + interval 1 day - interval 1 second;
        select count(*) into v_new_events from event where timestamp between v_report_month_start and v_report_month_end + interval 1 day - interval 1 second;

        select count(*) into v_total_users from user;
        select count(*) into v_total_webstates from webstate;
        select count(*) into v_total_replays from replay;
        select count(*) into v_total_events from event;

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

drop event if exists monthly_report_scheduler;
create event monthly_report_scheduler
on schedule every 1 month
starts date_format(now() + interval 1 month, '%Y-%m-02 02:00:00') 
do
begin
    call generate_monthly_report();
end;

drop trigger if exists before_input_data_insert_mask;

create trigger before_input_data_insert_mask
before insert on input_data
for each row
begin
    declare v_user_privacy_mask boolean default true; 
    declare v_replay_id char(36);
    declare v_html_hash char(64);
    declare v_email_domain varchar(255);
    declare v_email_name varchar(64);

    select replay_id into v_replay_id from event where event_id = new.event_id limit 1;

    if v_replay_id is not null then
        select html_hash into v_html_hash from replay where replay_id = v_replay_id limit 1;

        if v_html_hash is not null then
            select email_domain, email_name into v_email_domain, v_email_name from webstate where html_hash = v_html_hash limit 1;

            if v_email_domain is not null and v_email_name is not null then
                select privacy_mask into v_user_privacy_mask from user where email_domain = v_email_domain and email_name = v_email_name limit 1;
            end if;
        end if;
    end if;

    if v_user_privacy_mask = true then
        set new.text = repeat('*', length(new.text));
    end if;
end;

insert into user (email_domain, email_name, username, password, created_at, last_login, status, first_name, middle_name, last_name, phone_num, role, verified, fail_login, twofa)
values ('gmail.com','picokatx','theo','3a4b52fc88795615c55066100afbba60bea938b976fd40f13def78369a209f50','2024-02-05 07:30:25','2024-05-29 02:45:55','enabled','theo','weibin','1','1832555445','admin',1,0,1);
insert into webstate (html_hash, email_domain, email_name) values ('f62b9ab27ca98a242428f2c49b0b69d09af6568f9b83bf35cc6bf529312c3013', 'gmail.com', 'picokatx');
