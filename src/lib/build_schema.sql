drop database if exists caretdb;
create database caretdb;
use caretdb;

create table user (
    user_id char(32) primary key, -- 1bd31a8ef60e416ba3edd9fc9f8ee4ed
    email_domain varchar(255) check (
        email_domain regexp '^[a-zA-Z0-9\.\!\#\$\%\&\*\+\/\=\?\^\_\`\{\|\}\~\-]+$'
    ), -- https://en.wikipedia.org/wiki/Email_address#Domain
    email_name varchar(64) check (
        email_name regexp "^[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+(\\.[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+)*(\\+[a-zA-Z0-9-]+)?$"
    ), -- https://en.wikipedia.org/wiki/Email_address#Local-part
    username varchar(64) check (
        username regexp "^(?=.*[a-zA-Z])[a-z0-9_\\-\\.']{3,30}$" and
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
    twofa boolean not null default false
);
create table webstate (
    html_hash char(64) primary key check (
        html_hash regexp '^[a-f0-9]{64}$'
    )
);

create table replay (
    replay_id char(36) primary key, -- 123e4567-e89b-12d3-a456-426614174000
    start_time timestamp not null, -- 2024-03-29 10:00:00
    end_time timestamp not null, -- 2024-03-30 10:00:00
    product varchar(24) check (
        product in ('Chrome', 'Mozilla', 'AppleWebKit', 'Safari', 'Edge')
    ), -- Chrome Mozilla AppleWebKit
    product_version varchar(24) check (
        product_version regexp '^[0-9]+(\\.[0-9]+)*$'
    ), -- 91.0.4472.124  5.0  537.36 
    comment varchar(255),  -- this recording is about ... 
    device_type varchar(24) check (
        device_type in ('Desktop', 'Mobile', 'Unknown')
    ), -- x
    os_type varchar(24) check (
        os_type in ('Windows NT', 'Macintosh', 'Linux', 'iOS', 'Android')
    ), -- Macintosh; Intel Mac OS X; U; en
    os_version varchar(16) check (
        os_version regexp '^[0-9]+(_[0-9]+)*(\\.?[0-9]+)*$'
    ), -- 13_5_1 10.0 https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent#chrome_ua_string
    user_id char(32) not null, -- 3104290294 4802845253
    network_id varchar(15) check (
        network_id regexp '^[0-9]{1,3}(\\.[0-9]{1,3}){3}$'
    ), -- 183.30.196.133 422.225.101.242
    host_id varchar(4096) check (
        host_id regexp '^[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$'
    ), -- fonts.googleapis.com huggingface.co
    d_viewport_height int, -- 1 1320 1680
    d_viewport_width int, -- 1 1920 2560
    constraint correct_times check (
        start_time < end_time
    ),
    constraint chk_viewport_height check (
        d_viewport_height > 0
    ),
    constraint chk_viewport_width check (
        d_viewport_width > 0
    ),
    constraint fk_replay_user foreign key (user_id) references user(user_id)
);
-- #######################################################################
-- This is superceded by different types of elements in rrweb
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
  is_null      boolean not null sefault false,
  primary key (node_id, attribute_key)
);

-- #######################################################################
-- event time
-- #######################################################################
create table event (
  event_id   char(36)       primary key,
  type       enum('fullsnapshot','incrementalsnapshot','meta')   not null,
  timestamp  timestamp       not null,
  delay      int
);
create table meta_event (
  event_id char(36) primary key references event(event_id),
  href      text   not null,
  width     int    not null,
  height    int    not null
);
create table incremental_data (
  id      char(36)              primary key,
  source  enum (
    'mutation','mousemove','mouseinteraction','scroll','viewportresize',
    'input','touchmove','mediainteraction','stylesheetrule',
    'canvasmutation','font','log','drag','styledeclaration','selection',
    'adoptedstylesheet','customelement'
    )  not null
);

create table incremental_snapshot_event (
  event_id            char(36) primary key references event(event_id),
  incremental_data_id char(36) not null references incremental_data(id)
);
-- create table user_event (
--     replay_id char(36),
--     timestamp timestamp,
--     status varchar(16) check (
--         status in ('active', 'complete', 'error')
--     ),
--     source varchar(50),
--     html_hash char(64),
--     viewport_width int check (viewport_width > 0),
--     viewport_height int check (viewport_height > 0),
--     primary key (replay_id, timestamp),
--     foreign key (replay_id) references replay(replay_id),
--     foreign key (html_hash) references webstate(html_hash)
-- );

-- create table element_event (
--     replay_id char(36),
--     timestamp timestamp,
--     primary key (replay_id, timestamp),
--     foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
-- );

-- create table move_event (
--     replay_id char(36),
--     timestamp timestamp,
--     end_pos_x int check (end_pos_x >= 0),
--     end_pos_y int check (end_pos_y >= 0),
--     start_pos_x int check (start_pos_x >= 0),
--     start_pos_y int check (start_pos_y >= 0),
--     primary key (replay_id, timestamp),
--     foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
-- );

-- create table scroll_event (
--     replay_id char(36),
--     timestamp timestamp,
--     distance int,
--     primary key (replay_id, timestamp),
--     foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
-- );

-- create table navigate_event (
--     replay_id char(36),
--     timestamp timestamp,
--     url varchar(4096) check (
--         url regexp '^https?://([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}(/.*)?$'
--     ),
--     primary key (replay_id, timestamp),
--     foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
-- );

-- create table click_event (
--     replay_id char(36),
--     timestamp timestamp,
--     pos_x int check (pos_x >= 0),
--     pos_y int check (pos_y >= 0),
--     mouse_button_id int check (mouse_button_id in (0, 1, 2, 3, 4)), -- https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
--     primary key (replay_id, timestamp),
--     foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
-- );

-- create table drag_event (
--     replay_id char(36),
--     timestamp timestamp,
--     area int,
--     primary key (replay_id, timestamp),
--     foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
-- );

-- create table text_event (
--     replay_id char(36),
--     timestamp timestamp,
--     text text,
--     primary key (replay_id, timestamp),
--     foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
-- );

-- create table event_participating_elements (
--     replay_id char(36),
--     timestamp timestamp,
--     uid char(32),
--     html_hash char(64),
--     primary key (replay_id, timestamp, uid, html_hash),
--     foreign key (replay_id, timestamp) references user_event(replay_id, timestamp),
--     foreign key (uid) references element(uid),
--     foreign key (html_hash) references webstate(html_hash)
-- );
















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
        domain regexp '^[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$'
    ),
    value varchar(4096),
    same_site varchar(20) check (
        same_site in ('Strict', 'Lax', 'None')
    ),
    last_accessed timestamp,
    primary key (name, html_hash),
    foreign key (html_hash) references webstate(html_hash)
); -- https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis

INSERT INTO `user` VALUES ('001ecf8afc9649c58b5e94b570cd8356','nushigh.edu.sg','h1910153','theo','3a4b52fc88795615c55066100afbba60bea938b976fd40f13def78369a209f50','2024-02-05 07:30:25','2024-05-29 02:45:55','enabled','theo','weibin','1','1832555445','user',1,0,1);