export async function fetchAvailableBackendModules(signal?: AbortSignal): Promise<string[]> {
    const response = await fetch("/api/modules", {
        headers: {
            Accept: "application/json"
        },
        cache: "no-store",
        signal
    });

    if (!response.ok) {
        throw new Error(`Module availability request failed with status ${response.status}`);
    }

    const payload: unknown = await response.json();
    if (!isRecord(payload) || !Array.isArray(payload.availableModules) || !payload.availableModules.every(isString)) {
        throw new Error("Module availability response has an invalid shape");
    }

    return payload.availableModules;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
    return typeof value === "string";
}
