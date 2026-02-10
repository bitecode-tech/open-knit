DROP TABLE IF EXISTS wallet;
CREATE TABLE wallet
(
    id           BIGSERIAL PRIMARY KEY,
    uuid         UUID                     NOT NULL,
    user_id      VARCHAR(64)              NOT NULL,
    frozen       BOOLEAN                  NOT NULL DEFAULT TRUE,
    version      BIGINT                   NOT NULL DEFAULT 0,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (uuid),
    UNIQUE (user_id)
);

DROP TABLE IF EXISTS wallet_asset;
CREATE TABLE wallet_asset
(
    id           BIGSERIAL PRIMARY KEY,
    uuid         UUID                     NOT NULL,
    user_id      VARCHAR(64)              NOT NULL,
    name         VARCHAR(32)              NOT NULL,
    wallet_id    BIGINT                   NOT NULL,
    total_amount NUMERIC(10, 2)           NOT NULL,
    hold_amount  NUMERIC(10, 2)           NOT NULL,
    version      BIGINT                   NOT NULL DEFAULT 0,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (wallet_id) REFERENCES wallet (id),
    UNIQUE (user_id, name)
);

DROP TABLE IF EXISTS wallet_asset_event;
CREATE TABLE wallet_asset_event
(
    id              BIGSERIAL PRIMARY KEY,
    wallet_asset_id BIGINT                   NOT NULL,
    event_name      VARCHAR(64)              NOT NULL,
    event_data      JSONB                    NOT NULL,
    asset_name      VARCHAR(32)              NOT NULL,
    total_before    NUMERIC(10, 2)           NOT NULL,
    total_amount    NUMERIC(10, 2)           NOT NULL,
    total_after     NUMERIC(10, 2)           NOT NULL,
    version         BIGINT                   NOT NULL DEFAULT 0,
    created_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (wallet_asset_id) REFERENCES wallet_asset (id)
);