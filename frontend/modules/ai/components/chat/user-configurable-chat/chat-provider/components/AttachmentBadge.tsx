import React from "react";
import type {ChatMessageAttachment} from "@ai/components/chat/user-configurable-chat/chat-provider/types.ts";
import {getFileExtension} from "@ai/components/chat/user-configurable-chat/chat-provider/utils/attachments.ts";
import {formatFileSize} from "@ai/components/chat/user-configurable-chat/chat-provider/utils/format.ts";

export default function AttachmentBadge({attachment}: { attachment: ChatMessageAttachment }) {
    const extension = getFileExtension(attachment.name);
    const body = (
        <div
            className="flex min-w-[160px] max-w-[240px] items-center gap-2 rounded-xl bg-oxford-blue px-3 py-2 text-white"
            title={attachment.name}
        >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20 text-[11px] font-semibold uppercase tracking-wide text-white/90">
                {extension}
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-white">
                    {attachment.name}
                </div>
                <div className="text-[11px] text-white/70">
                    {formatFileSize(attachment.size)}
                </div>
            </div>
        </div>
    );

    if (attachment.downloadUrl) {
        return (
            <a
                href={attachment.downloadUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="no-underline"
            >
                {body}
            </a>
        );
    }

    return body;
}
