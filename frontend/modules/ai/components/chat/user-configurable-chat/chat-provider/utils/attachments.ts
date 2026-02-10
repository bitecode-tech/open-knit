import {baseConfig} from "@common/config/AxiosConfig.ts";
import type {ChatMessageAttachment} from "@ai/components/chat/user-configurable-chat/chat-provider/types.ts";

export function normalizeAttachments(
    files?: Array<Partial<ChatMessageAttachment> | null> | null
): ChatMessageAttachment[] {
    if (!files || files.length === 0) {
        return [];
    }
    return files.map((file, index) => {
        const safeFile = file ?? {};
        const resolvedUrl = resolveDownloadUrl(safeFile.downloadUrl);
        return {
            id: safeFile.id || `file-${index + 1}`,
            name: safeFile.name || `file-${index + 1}`,
            size: typeof safeFile.size === "number" ? safeFile.size : undefined,
            mimeType: safeFile.mimeType,
            downloadUrl: resolvedUrl,
        };
    });
}

export function resolveDownloadUrl(url?: string | null): string | undefined {
    if (!url) {
        return undefined;
    }
    const trimmed = url.trim();
    if (trimmed.length === 0) {
        return undefined;
    }
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    const base = String(baseConfig.baseURL ?? "").replace(/\/$/, "");
    const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return `${base}${normalized}`;
}

export function parseAttachmentsPayload(raw: string): ChatMessageAttachment[] | null {
    const trimmed = raw?.trim();
    if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) {
        return null;
    }
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed?.type === "files" && Array.isArray(parsed.files) && parsed.files.length > 0) {
            return normalizeAttachments(parsed.files);
        }
    } catch {
        return null;
    }
    return null;
}

export function getFileExtension(name: string) {
    const parts = name?.split?.(".") ?? [];
    if (parts.length <= 1) {
        return "FILE";
    }
    return (parts.pop() ?? "").toUpperCase() || "FILE";
}
