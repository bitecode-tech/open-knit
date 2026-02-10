export const PROVIDER_MODEL_CONFIGS = {
    "OPEN_AI": {
        label: "Chat GPT",
        visionEnabled: true,
        recordingEnabled: true,
    },
    "OLLAMA": {
        label: "Private (Offline)",
        visionEnabled: false,
        recordingEnabled: false,
    },
    "AZURE_AI_FOUNDRY": {
        label: "Azure AI Foundry",
        visionEnabled: false,
        recordingEnabled: false,
    }
} as const;

export type ProviderModelType = keyof typeof PROVIDER_MODEL_CONFIGS

export type ProviderModelConfig = (typeof PROVIDER_MODEL_CONFIGS)[ProviderModelType]