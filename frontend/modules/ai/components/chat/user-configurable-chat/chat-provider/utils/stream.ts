import type {ChatMessageResponse} from "@ai/components/chat/user-configurable-chat/chat-provider/types.ts";

export function tryDecodeBase64Utf8(data: string): string {
    try {
        const bin = atob(data);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    } catch {
        return data;
    }
}

export function splitIntoUnits(text: string, unitSize = 3): string[] {
    if (!text) return [];
    const chars = Array.from(text);
    if (unitSize <= 1) return chars;
    const units: string[] = [];
    for (let i = 0; i < chars.length; i += unitSize) {
        units.push(chars.slice(i, i + unitSize).join(""));
    }
    return units;
}

export function isChatMessageResponse(value: unknown): value is ChatMessageResponse {
    if (!value || typeof value !== "object") {
        return false;
    }
    return "error" in (value as Record<string, unknown>) || "message" in (value as Record<string, unknown>);
}
