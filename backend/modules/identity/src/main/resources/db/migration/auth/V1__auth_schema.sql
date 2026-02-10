DROP TABLE IF EXISTS "user" CASCADE;
CREATE TABLE "user"
(
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID                     NOT NULL,
    email           VARCHAR(255)             NOT NULL,
    email_confirmed BOOLEAN                  NOT NULL DEFAULT FALSE,
    mfa_enabled     BOOLEAN                  NOT NULL DEFAULT FALSE,
    mfa_method      varchar(32)              NULL,
    password        VARCHAR(255)             NULL,
    version         BIGINT                   NOT NULL DEFAULT 0,
    created_date    TIMESTAMP WITH TIME ZONE NULL     DEFAULT CURRENT_TIMESTAMP,
    updated_date    TIMESTAMP WITH TIME ZONE NULL     DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (uuid),
    UNIQUE (email)
);

DROP TABLE IF EXISTS "user_data" CASCADE;
CREATE TABLE "user_data"
(
    id           BIGSERIAL PRIMARY KEY,
    uuid         UUID                     NOT NULL,
    user_id      BIGINT                   NOT NULL,
    name         VARCHAR(255)             NULL,
    surname      VARCHAR(255)             NULL,
    created_date TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (uuid),
    FOREIGN KEY (user_id) REFERENCES "user" (id)
);

DROP TABLE IF EXISTS role CASCADE;
CREATE TABLE role
(
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(64)              NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name)
);

DROP TABLE IF EXISTS "user_roles" CASCADE;
CREATE TABLE "user_roles"
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT                   NOT NULL,
    role_id      BIGINT                   NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user" (id),
    FOREIGN KEY (role_id) REFERENCES role (id)
);

CREATE TABLE user_refresh_token
(
    id              BIGSERIAL PRIMARY KEY,
    uuid            uuid                     NOT NULL,
    user_id         BIGINT                   NOT NULL,
    username        varchar(255)             NOT NULL,
    expiration_time TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked         BOOLEAN                       DEFAULT FALSE,
    created_date    TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date    TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user" (id),
    UNIQUE (uuid)
);

CREATE INDEX ON user_refresh_token (username, revoked, expiration_time);

CREATE TABLE user_totp_secret
(
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT                   NOT NULL,
    secret       varchar(255)             NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "user" (id),
    UNIQUE (secret)
);

CREATE TABLE oauth_identity
(
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT                   NOT NULL,
    provider         VARCHAR(32)              NOT NULL,
    provider_user_id VARCHAR(128)             NOT NULL,
    email            VARCHAR(255),
    created_date     TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date     TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_user_id),
    FOREIGN KEY (user_id) REFERENCES "user" (id)
);

INSERT INTO "role"(name)
values ('ROLE_ADMIN');
INSERT INTO "role"(name)
values ('ROLE_USER');
