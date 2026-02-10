CREATE TABLE ai_agent
(
    id                              BIGSERIAL PRIMARY KEY,
    uuid                            UUID             NOT NULL UNIQUE,
    name                            VARCHAR(255)     NOT NULL,
    title                           text             NULL,
    provider                        varchar(32)      NULL     DEFAULT 'OPEN_AI',
    model                           varchar(128)     NULL,
    input_placeholder               varchar(255)     NULL,
    system_message                  TEXT             NULL,
    test_mode                       boolean          NOT NULL DEFAULT FALSE,
    access_password                 varchar(255)     NULL,
    access_password_enabled         boolean          NOT NULL DEFAULT FALSE,
    strategy_name                   varchar(128)     NOT NULL,
    deleted                         boolean          NOT NULL DEFAULT FALSE,
    temperature                     DOUBLE PRECISION          DEFAULT 0.7,
    top_p                           DOUBLE PRECISION NULL,
    max_tokens                      INTEGER          NULL,
    presence_penalty                DOUBLE PRECISION NULL,
    frequency_penalty               DOUBLE PRECISION NULL,
    short_term_memory_last_messages INTEGER          NULL     DEFAULT 20,
    created_date                    TIMESTAMP WITH TIME ZONE  DEFAULT CURRENT_TIMESTAMP,
    updated_date                    TIMESTAMP WITH TIME ZONE  DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON ai_agent (deleted);

CREATE TABLE ai_agent_exemplary_prompt
(
    id           BIGSERIAL PRIMARY KEY,
    uuid         UUID         NOT NULL UNIQUE,
    prompt       VARCHAR(255) NOT NULL,
    ai_agent_id  BIGINT       NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ai_agent_id) REFERENCES "ai_agent" (id)
);

CREATE TABLE chat_session
(
    id                  BIGSERIAL PRIMARY KEY,
    uuid                UUID         NOT NULL UNIQUE,
    external_session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id             UUID         NULL,
    agent_id            UUID         NOT NULL,
    created_date        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (agent_id) REFERENCES "ai_agent" (uuid)
);

CREATE INDEX ON chat_session (created_date);

CREATE TABLE chat_session_message
(
    id                  BIGSERIAL PRIMARY KEY,
    external_session_id VARCHAR(255) NOT NULL,
    message             TEXT         NOT NULL,
    type                VARCHAR(50)  NOT NULL,
    created_date        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date        TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (external_session_id) REFERENCES "chat_session" (external_session_id)
);

CREATE INDEX ON chat_session_message (external_session_id);
CREATE INDEX ON chat_session_message (created_date);

CREATE TABLE vector_document_ref
(
    id            BIGSERIAL PRIMARY KEY,
    uuid          UUID         NOT NULL UNIQUE,
    ai_agent_id   BIGINT       NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_ext      VARCHAR(255) NOT NULL,
    size_bytes    BIGINT       NOT NULL,
    deleted       BOOLEAN                  DEFAULT FALSE,
    created_date  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ai_agent_id) REFERENCES "ai_agent" (id)
);

CREATE INDEX ON vector_document_ref (deleted, ai_agent_id);

-- https://docs.spring.io/spring-ai/reference/api/vectordbs/pgvector.html
-- install extensions on public schema or use pgvector

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

CREATE TABLE IF NOT EXISTS vector_document_store
(
    id        uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    content   text,
    metadata  json,
    embedding vector(768)
);

CREATE INDEX ON vector_document_store USING HNSW (embedding vector_cosine_ops);
--

CREATE TABLE ai_services_provider_config
(
    id           BIGSERIAL PRIMARY KEY,
    uuid         UUID         NOT NULL UNIQUE,
    provider     varchar(255) NOT NULL,
    api_key      varchar(255) NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);