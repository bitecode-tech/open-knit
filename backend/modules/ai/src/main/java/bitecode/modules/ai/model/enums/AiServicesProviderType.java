package bitecode.modules.ai.model.enums;


public enum AiServicesProviderType {
    OPEN_AI(true),
    OLLAMA(false),
    AZURE_OPEN_AI(false),
    AZURE_AI_FOUNDRY(false);

    public final boolean requiresApiKey;

    AiServicesProviderType(boolean requiresApiKey) {
        this.requiresApiKey = requiresApiKey;
    }
}
