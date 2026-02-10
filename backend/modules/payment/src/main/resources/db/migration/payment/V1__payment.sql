DROP TABLE IF EXISTS payment;
CREATE TABLE payment
(
    id             BIGSERIAL PRIMARY KEY,
    uuid           UUID                     NOT NULL UNIQUE,
    user_id        UUID                     NOT NULL,
    transaction_id UUID                     NULL UNIQUE,
    amount         NUMERIC(12, 4)           NOT NULL,
    currency       varchar(32)              NOT NULL,
    gateway        VARCHAR(32)              NOT NULL,
    gateway_id     VARCHAR(128) UNIQUE,
    status         VARCHAR(64)              NOT NULL,
    type           VARCHAR(32)              NOT NULL,
    created_date   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, transaction_id)
);

CREATE INDEX ON payment (user_id);

DROP TABLE IF EXISTS payment_history;
CREATE TABLE payment_history
(
    id           BIGSERIAL PRIMARY KEY,
    payment_id   BIGINT                   NOT NULL,
    update_type  VARCHAR(32)              NOT NULL,
    update_data  JSON                     NOT NULL,
    applied      BOOLEAN                  NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payment (id)
);

CREATE UNIQUE INDEX ON payment_history (id, payment_id);

DROP TABLE IF EXISTS stripe_customer;
CREATE TABLE stripe_customer
(
    id                 BIGSERIAL PRIMARY KEY,
    user_id            UUID                     NOT NULL UNIQUE,
    stripe_customer_id varchar(128)             NOT NULL UNIQUE,
    created_date       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS subscription_plan;
CREATE TABLE subscription_plan
(
    id                     BIGSERIAL PRIMARY KEY,
    uuid                   UUID                     NOT NULL UNIQUE,
    name                   varchar(255)             NOT NULL,
    price                  NUMERIC(19, 2)           NOT NULL,
    currency               varchar(8)               NOT NULL,
    payment_frequency_type varchar(255)             NULL,
    payment_frequency      INTEGER                  NOT NULL,
    params                 jsonb                    NULL,
    created_date           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS subscription;
CREATE TABLE subscription
(
    id                   BIGSERIAL PRIMARY KEY,
    uuid                 UUID                     NOT NULL UNIQUE,
    user_id              UUID                     NOT NULL,
    subscription_plan_id BIGINT                   NOT NULL,
    external_id          VARCHAR(128)             NULL,
    currency             VARCHAR(32)              NULL,
    status               VARCHAR(32)              NOT NULL DEFAULT 'ACTIVE',
    next_payment_date    TIMESTAMP WITH TIME ZONE NULL,
    created_date         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_plan_id) REFERENCES "subscription_plan" (id)
);
CREATE INDEX ON subscription (status, user_id, subscription_plan_id);

DROP TABLE IF EXISTS subscription_history;
CREATE TABLE subscription_history
(
    id              BIGSERIAL PRIMARY KEY,
    uuid            UUID                     NOT NULL UNIQUE,
    subscription_id BIGINT                   NOT NULL,
    payment_id      BIGINT                   NOT NULL,
    amount          NUMERIC(19, 2)           NOT NULL,
    currency        varchar(16)              NOT NULL,
    created_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subscription_id) REFERENCES "subscription" (id),
    FOREIGN KEY (payment_id) REFERENCES "payment" (id)
);

