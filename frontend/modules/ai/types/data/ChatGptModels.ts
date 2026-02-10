export const CHAT_GPT_MODELS = [
    // GPT-5 series (latest flagship with reasoning & fast variants)
    "gpt-5.2",
    "gpt-5.1",
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5-thinking",
    "gpt-5-thinking-mini",
    "gpt-5-thinking-nano",
    "gpt-5-chat-latest",

    // GPT series (general-purpose / multimodal)
    "gpt-4",            // older flagship (still API-supported)
    "gpt-4o",           // "omni" multimodal flagship
    "gpt-4o-mini",      // smaller, cheaper variant
    "gpt-4.5",          // transitional model (research preview)
    "gpt-4.1",          // API-first newer variant
    "gpt-4.1-mini",     // smaller variant of 4.1

    // Reasoning ("o-series") models
    "o1-preview",       // early preview of reasoning models
    "o1-mini",          // lightweight variant of o1
    "o1",               // full release
    "o1-pro",           // high-capability version for Pro users
    "o3-mini",          // successor to o1-mini
    "o3-mini-high",     // higher-reasoning effort variant
    "o3",               // full reasoning model
    "o4-mini",          // compact reasoning model
    "o4-mini-high",     // higher-effort compact variant
    "o3-pro"            // the most capable reasoning model
] as const;

export const CHAT_GPT_RECORDING_MODELS = [
    "whisper-1"
] as const;