export const AZURE_AI_FOUNDRY_MODELS = (import.meta.env.VITE_PUBLIC_AZURE_FOUNDRY_AVAILABLE_MODELS as string | undefined)
    ?.split(",")
    .map(model => model.trim())
    .filter(Boolean) ?? [];