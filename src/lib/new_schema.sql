%%sql

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
  type       ENUM('FullSnapshot','IncrementalSnapshot','Meta')   NOT NULL,
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
  source  ENUM (
    'Mutation','MouseMove','MouseInteraction','Scroll','ViewportResize',
    'Input','TouchMove','MediaInteraction','StyleSheetRule',
    'CanvasMutation','Font','Log','Drag','StyleDeclaration','Selection',
    'AdoptedStyleSheet','CustomElement'
    )  NOT NULL
);

CREATE TABLE incremental_snapshot_event (
  event_id            char(36) PRIMARY KEY REFERENCES event(event_id),
  incremental_data_id char(36) NOT NULL REFERENCES incremental_data(id)
);


-- 5. MUTATION DATA & CHILD TABLES
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
  mutation_data_id char(36)    NOT NULL,
  node_id          INT    NOT NULL,
  attribute_key    char(32)   NOT NULL,
  string_value     TEXT,
  style_om_value_id INT REFERENCES style_om_value(id),
  PRIMARY KEY (mutation_data_id, node_id, attribute_key),
  FOREIGN KEY (mutation_data_id, node_id) REFERENCES attribute_mutation(mutation_data_id, node_id)
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
CREATE TABLE mousemove_data (
  id char(36) PRIMARY KEY REFERENCES incremental_data(id)
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
CREATE TABLE mouse_interaction_data (
  id               char(36)               PRIMARY KEY REFERENCES incremental_data(id),
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
  id      char(36) PRIMARY KEY REFERENCES incremental_data(id),
  node_id INT NOT NULL,
  x       INT NOT NULL,
  y       INT NOT NULL
);


-- 9. VIEWPORT RESIZE
CREATE TABLE viewport_resize_data (
  id     char(36) PRIMARY KEY REFERENCES incremental_data(id),
  width  INT NOT NULL,
  height INT NOT NULL
);


-- 10. INPUT
CREATE TABLE input_data (
  id             char(36)     PRIMARY KEY REFERENCES incremental_data(id),
  node_id        INT     NOT NULL,
  text           TEXT    NOT NULL,
  is_checked     BOOLEAN NOT NULL,
  user_triggered BOOLEAN NOT NULL DEFAULT FALSE
);


-- 11. MEDIA INTERACTIONS
CREATE TABLE media_interaction_data (
  id               char(36)    PRIMARY KEY REFERENCES incremental_data(id),
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
