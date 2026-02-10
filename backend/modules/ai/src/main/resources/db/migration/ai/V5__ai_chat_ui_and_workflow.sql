ALTER TABLE ai.ai_agent
    ADD COLUMN IF NOT EXISTS chat_ui             VARCHAR(32) DEFAULT 'DEFAULT',
    ADD COLUMN IF NOT EXISTS chatkit_workflow_id VARCHAR(255);
