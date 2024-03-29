create table if not exists account
(
    id          TEXT    not null
        primary key,
    name        TEXT    not null
        unique,
    password    TEXT    not null,
    is_admin    INTEGER not null,
    description TEXT,
    update_id   TEXT    not null,
    update_date TEXT    not null
);

create table if not exists  storage
(
    id          TEXT not null,
    name        TEXT not null
        constraint storage_pk
            unique,
    endpoint    TEXT not null,
    access_key  TEXT not null,
    secret_key  TEXT not null,
    path_style  INTEGER not null,
    update_id   TEXT not null,
    update_date TEXT not null,
    region      TEXT
);

