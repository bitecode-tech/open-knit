ALTER TABLE ai.ai_agent
    ADD COLUMN file_upload_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    ADD COLUMN vision_model        VARCHAR(128)         NOT NULL default 'SET MODEL';
