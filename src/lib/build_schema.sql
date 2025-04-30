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

create table webstate (
    html_hash char(64) primary key check (
        html_hash regexp '^[a-f0-9]{64}$'
    )
);

create table element (
    uid char(32) primary key check (
        uid regexp '^[a-f0-9]{32}$'
    ),
    html_hash char(64),
    tag varchar(24),
    xpath varchar(255), -- path/to/element
    text varchar(4096), -- some text inside the element
    xpos int check (xpos >= 0),
    ypos int check (ypos >= 0),
    height int check (height > 0),
    width int check (width > 0),
    z_index int default 0,
    foreign key (html_hash) references webstate(html_hash)
);

create table element_attributes (
    uid char(32),
    html_hash char(64),
    attribute varchar(100),
    primary key (uid, html_hash, attribute),
    foreign key (uid) references element(uid),
    foreign key (html_hash) references webstate(html_hash)
);

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

create table user_event (
    replay_id char(36),
    timestamp timestamp,
    event_id char(36),
    status varchar(16) check (
        status in ('active', 'complete', 'error')
    ),
    source varchar(50),
    html_hash char(64),
    viewport_width int check (viewport_width > 0),
    viewport_height int check (viewport_height > 0),
    primary key (event_id),
    foreign key (replay_id) references replay(replay_id),
    foreign key (html_hash) references webstate(html_hash)
);

create table mutation_event(
    event_id char(36),
    timestamp timestamp,
    isAttachIframe boolean default true
    primary key (event_id)
);

CREATE TABLE text_mutation (
    event_id char(36)
    mutation_data_id INTEGER REFERENCES mutation_data(id),
);

CREATE TABLE attribute_mutation (
    id SERIAL PRIMARY KEY,
    mutation_data_id INTEGER REFERENCES mutation_data(id),
);

CREATE TABLE removed_node_mutation (
    id SERIAL PRIMARY KEY,
    mutation_data_id INTEGER REFERENCES mutation_data(id),
);

CREATE TABLE added_node_mutation (
    id SERIAL PRIMARY KEY,
    mutation_data_id INTEGER REFERENCES mutation_data(id),
    -- fields of addedNodeMutation here
);

create table move_event (
    replay_id char(36),
    timestamp timestamp,
    end_pos_x int check (end_pos_x >= 0),
    end_pos_y int check (end_pos_y >= 0),
    start_pos_x int check (start_pos_x >= 0),
    start_pos_y int check (start_pos_y >= 0),
    primary key (replay_id, timestamp),
    foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
);

create table scroll_event (
    replay_id char(36),
    timestamp timestamp,
    distance int,
    primary key (replay_id, timestamp),
    foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
);

create table navigate_event (
    replay_id char(36),
    timestamp timestamp,
    url varchar(4096) check (
        url regexp '^https?://([a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}(/.*)?$'
    ),
    primary key (replay_id, timestamp),
    foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
);

create table click_event (
    replay_id char(36),
    timestamp timestamp,
    pos_x int check (pos_x >= 0),
    pos_y int check (pos_y >= 0),
    mouse_button_id int check (mouse_button_id in (0, 1, 2, 3, 4)), -- https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
    primary key (replay_id, timestamp),
    foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
);

create table drag_event (
    replay_id char(36),
    timestamp timestamp,
    area int,
    primary key (replay_id, timestamp),
    foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
);

create table text_event (
    replay_id char(36),
    timestamp timestamp,
    text text,
    primary key (replay_id, timestamp),
    foreign key (replay_id, timestamp) references user_event(replay_id, timestamp)
);

create table event_participating_elements (
    replay_id char(36),
    timestamp timestamp,
    uid char(32),
    html_hash char(64),
    primary key (replay_id, timestamp, uid, html_hash),
    foreign key (replay_id, timestamp) references user_event(replay_id, timestamp),
    foreign key (uid) references element(uid),
    foreign key (html_hash) references webstate(html_hash)
);

CREATE TYPE event_type AS ENUM (
  'FullSnapshot','IncrementalSnapshot','Meta'
);

CREATE TYPE incremental_source AS ENUM (
  'Mutation','MouseMove','MouseInteraction','Scroll','ViewportResize',
  'Input','TouchMove','MediaInteraction','StyleSheetRule',
  'CanvasMutation','Font','Log','Drag','StyleDeclaration','Selection',
  'AdoptedStyleSheet','CustomElement'
);

CREATE TYPE mouse_interactions AS ENUM (
  'MouseUp','MouseDown','Click','ContextMenu','DblClick',
  'Focus','Blur','TouchStart','TouchMove_Departed','TouchEnd','TouchCancel'
);

CREATE TYPE pointer_type AS ENUM ('Mouse','Pen','Touch');

CREATE TYPE media_interactions AS ENUM (
  'Play','Pause','Seeked','VolumeChange','RateChange'
);

CREATE TYPE node_type AS ENUM (
  'Document','DocumentType','Element','Text','CDATA','Comment'
);


-- 2. SERIALIZED NODES
----------------------
CREATE TABLE serialized_node (
  id               INT                PRIMARY KEY,
  type             node_type          NOT NULL,
  root_id          INT,                             -- optional root
  is_shadow_host   BOOLEAN            NOT NULL DEFAULT FALSE,
  is_shadow        BOOLEAN            NOT NULL DEFAULT FALSE,

  -- document‐specific
  compat_mode      TEXT,
  name             TEXT,
  public_id        TEXT,
  system_id        TEXT,

  -- element‐specific
  tag              varchar(24),
  is_svg           BOOLEAN            NOT NULL DEFAULT FALSE,
  need_block       BOOLEAN            NOT NULL DEFAULT FALSE,
  is_custom        BOOLEAN            NOT NULL DEFAULT FALSE,

  -- text/cdata/comment
  text_content     TEXT
);

-- 2a. element child nodes (document+element)
CREATE TABLE serialized_node_child (
  parent_id INT NOT NULL REFERENCES serialized_node(id),
  child_id  INT NOT NULL REFERENCES serialized_node(id),
  PRIMARY KEY (parent_id, child_id)
);

-- 2b. element attributes (string|number|true|null)
CREATE TABLE serialized_node_attribute (
  node_id      INT     NOT NULL REFERENCES serialized_node(id),
  attribute_key TEXT   NOT NULL,
  string_value TEXT,
  number_value NUMERIC,
  is_true      BOOLEAN NOT NULL DEFAULT FALSE,
  is_null      BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (node_id, attribute_key)
);


-- 3. STYLE-OM VALUES (for any styleOMValue usage)
---------------------------------------------------
CREATE TABLE style_om_value (
  id SERIAL PRIMARY KEY
);
CREATE TABLE style_om_value_entry (
  id                 SERIAL PRIMARY KEY,
  style_om_value_id  INT    NOT NULL REFERENCES style_om_value(id),
  property           TEXT   NOT NULL,
  value_string       TEXT,
  priority           TEXT,
);


-- 4. EVENTS
------------
CREATE TABLE event (
  event_id   char(36)       PRIMARY KEY,
  type       event_type   NOT NULL,
  timestamp  timestamp       NOT NULL,
  delay      INT
);

-- FullSnapshot
CREATE TABLE full_snapshot_event (
  event_id            char(36) PRIMARY KEY REFERENCES event(event_id),
  node_id             INT NOT NULL REFERENCES serialized_node(id),
  initial_offset_top  INT NOT NULL,
  initial_offset_left INT NOT NULL
);

-- Meta
CREATE TABLE meta_event (
  event_id char(36) PRIMARY KEY REFERENCES event(event_id),
  href      TEXT   NOT NULL,
  width     INT    NOT NULL,
  height    INT    NOT NULL
);

-- IncrementalSnapshot
CREATE TABLE incremental_data (
  id      char(36)              PRIMARY KEY,
  source  incremental_source  NOT NULL
);

CREATE TABLE incremental_snapshot_event (
  event_id            char(36) PRIMARY KEY REFERENCES event(event_id),
  incremental_data_id INT NOT NULL REFERENCES incremental_data(id)
);


-- 5. MUTATION DATA & CHILD TABLES
-----------------------------------
CREATE TABLE mutation_data (
  id               char(36)  PRIMARY KEY REFERENCES incremental_data(id),
  is_attach_iframe BOOLEAN NOT NULL DEFAULT FALSE
);

-- texts[]
CREATE TABLE text_mutation (
  mutation_data_id char(36)    NOT NULL REFERENCES mutation_data(id),
  node_id          INT    NOT NULL,
  value            TEXT,
  PRIMARY KEY (mutation_data_id, node_id)
);

-- attributes[]
CREATE TABLE attribute_mutation (
  mutation_data_id char(36)    NOT NULL REFERENCES mutation_data(id),
  node_id          INT    NOT NULL,
  PRIMARY KEY (mutation_data_id, node_id)
);
CREATE TABLE attribute_mutation_entry (
  mutation_data_id char(36)    NOT NULL REFERENCES attribute_mutation(mutation_data_id),
  node_id          INT    NOT NULL,
  attribute_key    TEXT   NOT NULL,
  string_value     TEXT,
  style_om_value_id INT REFERENCES style_om_value(id),
  PRIMARY KEY (mutation_data_id, node_id, attribute_key)
);

-- removes[]
CREATE TABLE removed_node_mutation (
  mutation_data_id char(36)    NOT NULL REFERENCES mutation_data(id),
  parent_id        INT    NOT NULL,
  node_id          INT    NOT NULL,
  is_shadow        BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (mutation_data_id, node_id)
);

-- adds[]
CREATE TABLE added_node_mutation (
  mutation_data_id char(36)    NOT NULL REFERENCES mutation_data(id),
  parent_id        INT    NOT NULL,
  previous_id      INT,
  next_id          INT,
  node_id          INT    NOT NULL REFERENCES serialized_node(id),
  PRIMARY KEY (mutation_data_id, parent_id, node_id)
);


-- 6. MOUSEMOVE / TOUCHMOVE / DRAG
-----------------------------------
CREATE TABLE mousemove_data (
  char(36) INT PRIMARY KEY REFERENCES incremental_data(id)
);
CREATE TABLE mouse_position (
  mousemove_data_id char(36) NOT NULL REFERENCES mousemove_data(id),
  x                 INT NOT NULL,
  y                 INT NOT NULL,
  node_id           INT NOT NULL,
  time_offset       INT NOT NULL,
  PRIMARY KEY (mousemove_data_id, node_id, time_offset)
);


-- 7. MOUSE INTERACTIONS
-------------------------
CREATE TABLE mouse_interaction_data (
  id               char(36)               PRIMARY KEY REFERENCES incremental_data(id),
  interaction_type mouse_interactions NOT NULL,
  node_id          INT               NOT NULL,
  x                INT,
  y                INT,
  pointer_type     pointer_type
);


-- 8. SCROLL
-------------
CREATE TABLE scroll_data (
  id      char(36) PRIMARY KEY REFERENCES incremental_data(id),
  node_id INT NOT NULL,
  x       INT NOT NULL,
  y       INT NOT NULL
);


-- 9. VIEWPORT RESIZE
----------------------
CREATE TABLE viewport_resize_data (
  id     char(36) PRIMARY KEY REFERENCES incremental_data(id),
  width  INT NOT NULL,
  height INT NOT NULL
);


-- 10. INPUT
-------------
CREATE TABLE input_data (
  id             char(36)     PRIMARY KEY REFERENCES incremental_data(id),
  node_id        INT     NOT NULL,
  text           TEXT    NOT NULL,
  is_checked     BOOLEAN NOT NULL,
  user_triggered BOOLEAN NOT NULL DEFAULT FALSE
);


-- 11. MEDIA INTERACTIONS
--------------------------
CREATE TABLE media_interaction_data (
  id               char(36)                PRIMARY KEY REFERENCES incremental_data(id),
  interaction_type media_interactions NOT NULL,
  node_id          INT                NOT NULL,
  current_time     NUMERIC,
  volume           NUMERIC,
  muted            BOOLEAN,
  loop             BOOLEAN,
  playback_rate    NUMERIC
);


-- 15. FONT
------------
CREATE TABLE font_data (
  id          char(36)  PRIMARY KEY REFERENCES incremental_data(id),
  family      TEXT NOT NULL,
  font_source TEXT NOT NULL,
  buffer      BOOLEAN NOT NULL
);
CREATE TABLE font_descriptor (
  id           SERIAL PRIMARY KEY,
  font_data_id char(36)    NOT NULL REFERENCES font_data(id),
  descriptor_key   TEXT  NOT NULL,
  descriptor_value TEXT  NOT NULL
);


-- 16. SELECTION
-----------------
CREATE TABLE selection_data (
  id char(36) PRIMARY KEY REFERENCES incremental_data(id)
);
CREATE TABLE selection_range (
  id               SERIAL PRIMARY KEY,
  selection_data_id char(36)   NOT NULL REFERENCES selection_data(id),
  start            INT    NOT NULL,
  start_offset     INT    NOT NULL,
  end              INT    NOT NULL,
  end_offset       INT    NOT NULL
);