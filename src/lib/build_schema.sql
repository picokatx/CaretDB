drop database if exists caretdb;
create database caretdb;
use caretdb;

create table user (
    user_id char(32) primary key, -- 1bd31a8ef60e416ba3edd9fc9f8ee4ed
    email_domain varchar(255) check (
        email_domain regexp '^[a-zA-Z0-9\\.\\!\\#\\$\\%\\&\\*\\+\\/\\=\\?\\^\\_\\`\\{\\|\\}\\~\\-]+$'
    ), -- https://en.wikipedia.org/wiki/Email_address#Domain
    email_name varchar(64) check (
        email_name regexp "^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(\\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*(\\+[a-zA-Z0-9-]+)?$"
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
    ),
    user_id char(32) not null, -- Added user_id
    constraint fk_webstate_user foreign key (user_id) references user(user_id) -- Added FK
);

create table replay (
    replay_id char(36) primary key, -- 123e4567-e89b-12d3-a456-426614174000
    html_hash char(64) not null, -- Added html_hash
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
        device_type in ('Desktop', 'Mobile', 'Tablet', 'Unknown') -- Added Tablet based on API logic
    ), -- x
    os_type varchar(24) check (
        os_type in ('Windows NT', 'Macintosh', 'Linux', 'iOS', 'Android')
    ), -- Macintosh; Intel Mac OS X; U; en
    os_version varchar(16) check (
        os_version regexp '^[0-9]+(_[0-9]+)*(\\.?[0-9]+)*$'
    ), -- 13_5_1 10.0 https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent#chrome_ua_string
    -- user_id char(32) not null, -- Removed user_id
    network_id varchar(15) check (
        network_id regexp '^[0-9]{1,3}(\\.[0-9]{1,3}){3}$'
    ), -- 183.30.196.133 422.225.101.242
    host_id varchar(4096) check (
        host_id regexp '^[a-zA-Z0-9-]+(\\.[a-zA-Z0-9-]+)+$'
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
    constraint fk_replay_webstate foreign key (html_hash) references webstate(html_hash) -- Added FK
    -- constraint fk_replay_user foreign key (user_id) references user(user_id) -- Removed FK
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
-- 1. SERIALIZED NODES
CREATE TABLE serialized_node (
  id               INT                PRIMARY KEY,
  type             ENUM (
    'Document','DocumentType','Element','Text','CDATA','Comment'
    )          NOT NULL,
  root_id          INT,                             
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
  attribute_key varchar(32)   NOT NULL,
  string_value TEXT,
  number_value NUMERIC,
  is_true      BOOLEAN NOT NULL DEFAULT FALSE,
  is_null      BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (node_id, attribute_key)
);


-- 3. STYLE-OM VALUES (for any styleOMValue usage)
CREATE TABLE style_om_value (
  id int AUTO_INCREMENT PRIMARY KEY
);

CREATE TABLE style_om_value_entry (
  id                 INT,
  property           char(32)   NOT NULL,
  value_string       TEXT,
  priority           TEXT,
  PRIMARY KEY (id, property)
);


-- 4. EVENTS
CREATE TABLE event (
  event_id   char(36)       PRIMARY KEY,
  replay_id  char(36)       NOT NULL, -- Added replay_id
  type       ENUM('FullSnapshot','IncrementalSnapshot','Meta')   NOT NULL,
  timestamp  timestamp       NOT NULL,
  delay      INT,
  constraint fk_event_replay foreign key (replay_id) references replay(replay_id) -- Added FK
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
-- DROP TABLE IF EXISTS incremental_data; -- No longer needed

-- Removed incremental_data table definition

CREATE TABLE incremental_snapshot_event (
  event_id            char(36) PRIMARY KEY REFERENCES event(event_id),
  -- incremental_data_id char(36) NOT NULL REFERENCES incremental_data(id) -- Removed
  t  ENUM (  -- Renamed from source and moved here
    'Mutation','MouseMove','MouseInteraction','Scroll','ViewportResize',
    'Input','TouchMove','MediaInteraction','StyleSheetRule',
    'CanvasMutation','Font','Log','Drag','StyleDeclaration','Selection',
    'AdoptedStyleSheet','CustomElement'
    )  NOT NULL
);


-- 5. MUTATION DATA & CHILD TABLES
CREATE TABLE mutation_data (
  -- id               char(36)  PRIMARY KEY REFERENCES incremental_data(id), -- Changed PK and FK
  event_id         char(36)  PRIMARY KEY REFERENCES incremental_snapshot_event(event_id),
  is_attach_iframe BOOLEAN NOT NULL DEFAULT FALSE
);

-- texts[]
CREATE TABLE text_mutation (
  -- mutation_data_id char(36)    NOT NULL REFERENCES mutation_data(id), -- Changed FK
  event_id         char(36)    NOT NULL REFERENCES mutation_data(event_id),
  node_id          INT    NOT NULL,
  value            TEXT,
  PRIMARY KEY (event_id, node_id) -- Changed PK
);

-- attributes[]
CREATE TABLE attribute_mutation (
  -- mutation_data_id char(36)    NOT NULL REFERENCES mutation_data(id), -- Changed FK
  event_id         char(36)    NOT NULL REFERENCES mutation_data(event_id),
  node_id          INT    NOT NULL,
  PRIMARY KEY (event_id, node_id) -- Changed PK
);

CREATE TABLE attribute_mutation_entry (
  -- mutation_data_id char(36)    NOT NULL, -- Changed target table in FK below
  event_id         char(36)    NOT NULL,
  node_id          INT    NOT NULL,
  attribute_key    char(32)   NOT NULL,
  string_value     TEXT,
  style_om_value_id INT REFERENCES style_om_value(id),
  PRIMARY KEY (event_id, node_id, attribute_key), -- Changed PK
  FOREIGN KEY (event_id, node_id) REFERENCES attribute_mutation(event_id, node_id) -- Changed FK
);

-- removes[]
CREATE TABLE removed_node_mutation (
  -- mutation_data_id char(36)    NOT NULL REFERENCES mutation_data(id), -- Changed FK
  event_id         char(36)    NOT NULL REFERENCES mutation_data(event_id),
  parent_id        INT    NOT NULL,
  node_id          INT    NOT NULL,
  is_shadow        BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (event_id, node_id) -- Changed PK
);

-- adds[]
CREATE TABLE added_node_mutation (
  -- mutation_data_id char(36)    NOT NULL REFERENCES mutation_data(id), -- Changed FK
  event_id         char(36)    NOT NULL REFERENCES mutation_data(event_id),
  parent_id        INT    NOT NULL,
  previous_id      INT,
  next_id          INT,
  node_id          INT    NOT NULL REFERENCES serialized_node(id),
  PRIMARY KEY (event_id, parent_id, node_id) -- Changed PK
);


-- 6. MOUSEMOVE / TOUCHMOVE / DRAG
CREATE TABLE mousemove_data (
  -- id char(36) PRIMARY KEY REFERENCES incremental_data(id) -- Changed PK and FK
  event_id char(36) PRIMARY KEY REFERENCES incremental_snapshot_event(event_id)
);

CREATE TABLE mouse_position (
  -- mousemove_data_id char(36) NOT NULL REFERENCES mousemove_data(id), -- Changed FK
  event_id          char(36) NOT NULL REFERENCES mousemove_data(event_id),
  x                 INT NOT NULL,
  y                 INT NOT NULL,
  node_id           INT NOT NULL,
  time_offset       INT NOT NULL,
  PRIMARY KEY (event_id, node_id, time_offset) -- Changed PK
);


-- 7. MOUSE INTERACTIONS
CREATE TABLE mouse_interaction_data (
  -- id               char(36)               PRIMARY KEY REFERENCES incremental_data(id), -- Changed PK and FK
  event_id         char(36)               PRIMARY KEY REFERENCES incremental_snapshot_event(event_id),
  interaction_type ENUM (
    'MouseUp','MouseDown','Click','ContextMenu','DblClick',
    'Focus','Blur','TouchStart','TouchMove_Departed','TouchEnd','TouchCancel'
    ) NOT NULL,
  node_id          INT               NOT NULL,
  x                INT,
  y                INT,
  pointer_type     ENUM ('Mouse','Pen','Touch')
);


-- 8. SCROLL
CREATE TABLE scroll_data (
  -- id      char(36) PRIMARY KEY REFERENCES incremental_data(id), -- Changed PK and FK
  event_id char(36) PRIMARY KEY REFERENCES incremental_snapshot_event(event_id),
  node_id INT NOT NULL,
  x       INT NOT NULL,
  y       INT NOT NULL
);


-- 9. VIEWPORT RESIZE
CREATE TABLE viewport_resize_data (
  -- id     char(36) PRIMARY KEY REFERENCES incremental_data(id), -- Changed PK and FK
  event_id char(36) PRIMARY KEY REFERENCES incremental_snapshot_event(event_id),
  width  INT NOT NULL,
  height INT NOT NULL
);


-- 10. INPUT
CREATE TABLE input_data (
  -- id             char(36)     PRIMARY KEY REFERENCES incremental_data(id), -- Changed PK and FK
  event_id       char(36)     PRIMARY KEY REFERENCES incremental_snapshot_event(event_id),
  node_id        INT     NOT NULL,
  text           TEXT    NOT NULL,
  is_checked     BOOLEAN NOT NULL,
  user_triggered BOOLEAN NOT NULL DEFAULT FALSE
);


-- 11. MEDIA INTERACTIONS
CREATE TABLE media_interaction_data (
  -- id               char(36)    PRIMARY KEY REFERENCES incremental_data(id), -- Changed PK and FK
  event_id         char(36)    PRIMARY KEY REFERENCES incremental_snapshot_event(event_id),
  interaction_type  ENUM(
    'Play','Pause','Seeked','VolumeChange','RateChange'
    ) NOT NULL,
  node_id          INT     NOT NULL,
  time             DECIMAL(8,4),
  volume           DECIMAL(8,4),
  muted            BOOLEAN,
  isloop             BOOLEAN,
  playback_rate    DECIMAL(8,4)
);


-- 15. FONT
CREATE TABLE font_data (
  -- id          char(36)  PRIMARY KEY REFERENCES incremental_data(id), -- Changed PK and FK
  event_id    char(36)  PRIMARY KEY REFERENCES incremental_snapshot_event(event_id),
  family      TEXT NOT NULL,
  font_source TEXT NOT NULL,
  buffer      BOOLEAN NOT NULL
);

CREATE TABLE font_descriptor (
  id               SERIAL PRIMARY KEY,
  -- font_data_id char(36)    NOT NULL REFERENCES font_data(id), -- Changed FK
  event_id         char(36)    NOT NULL REFERENCES font_data(event_id),
  descriptor_key   TEXT  NOT NULL,
  descriptor_value TEXT  NOT NULL
);


-- 16. SELECTION
CREATE TABLE selection_data (
  -- id char(36) PRIMARY KEY REFERENCES incremental_data(id) -- Changed PK and FK
  event_id char(36) PRIMARY KEY REFERENCES incremental_snapshot_event(event_id)
);

CREATE TABLE selection_range (
  id               SERIAL PRIMARY KEY,
  -- selection_data_id char(36)   NOT NULL REFERENCES selection_data(id), -- Changed FK
  event_id         char(36)   NOT NULL REFERENCES selection_data(event_id),
  start            INT    NOT NULL,
  start_offset     INT    NOT NULL,
  end              INT    NOT NULL,
  end_offset       INT    NOT NULL
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