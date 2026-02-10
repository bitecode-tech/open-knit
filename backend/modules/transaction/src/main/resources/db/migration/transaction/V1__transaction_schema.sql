DROP TABLE IF EXISTS transaction;
CREATE TABLE transaction
(
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID                     NOT NULL,
    user_id             UUID                     NOT NULL,
    payment_id          UUID,
    type                VARCHAR(32)              NOT NULL,
    status              VARCHAR(64)              NOT NULL,
    sub_status          VARCHAR(64)              NOT NULL,
    debit_total         NUMERIC(10, 2)           NOT NULL,
    debit_type          VARCHAR(32)              NOT NULL,
    debit_currency      VARCHAR(16)              NOT NULL,
    debit_subtype       VARCHAR(16),
    debit_reference_id  VARCHAR(255),
    credit_total        NUMERIC(10, 2)           NOT NULL,
    credit_type         VARCHAR(32)              NOT NULL,
    credit_subtype      VARCHAR(32),
    credit_currency     VARCHAR(16)              NOT NULL,
    credit_reference_id VARCHAR(255),
    version             BIGINT                   NOT NULL DEFAULT 0,
    created_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (uuid),
    UNIQUE (payment_id)
);

CREATE INDEX ON transaction (user_id, "type", status);

DROP TABLE IF EXISTS transaction_event;
CREATE TABLE transaction_event
(
    id             BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT                   NOT NULL REFERENCES transaction (id),
    event_name     VARCHAR(64)              NOT NULL,
    event_data     JSONB                    NOT NULL,
    version        BIGINT                   NOT NULL DEFAULT 0,
    created_date   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ON transaction_event (transaction_id);