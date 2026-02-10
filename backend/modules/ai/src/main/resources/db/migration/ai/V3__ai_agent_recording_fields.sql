ALTER TABLE ai.ai_agent
    ADD COLUMN recording_enabled BOOLEAN      DEFAULT FALSE NOT NULL,
    ADD COLUMN recording_model   VARCHAR(128) DEFAULT 'whisper-1';
