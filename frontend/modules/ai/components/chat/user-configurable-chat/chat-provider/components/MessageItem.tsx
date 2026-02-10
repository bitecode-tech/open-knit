import React from "react";
import clsx from "clsx";
import MarkdownRenderer from "@common/components/elements/MarkdownRenderer.tsx";
import type {ChatMessage, ChatMessageAttachment} from "@ai/components/chat/user-configurable-chat/chat-provider/types.ts";
import AttachmentBadge from "@ai/components/chat/user-configurable-chat/chat-provider/components/AttachmentBadge.tsx";

function UserMessageBubble({text, attachments}: { text: string; attachments?: ChatMessageAttachment[] }) {
    const hasText = !!text?.trim();
    const hasAttachments = !!attachments?.length;

    return (
        <div className="flex justify-end">
            <div
                className="max-w-[80%] rounded-2xl px-2 md:px-3 py-3 bg-oxford-blue text-white overflow-x-hidden"
            >
                <div className="flex flex-col gap-3 text-lg leading-relaxed">
                    {hasText && (
                        <div className="whitespace-pre-wrap break-words">
                            {text}
                        </div>
                    )}
                    {hasAttachments && (
                        <div className={clsx("flex flex-wrap gap-2", hasText && "pt-2 border-t border-white/15")}>
                            {attachments!.map(attachment => (
                                <AttachmentBadge key={attachment.id} attachment={attachment}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function AssistantMessagePanel({text, title, isError, attachments}: {
    text: string;
    title?: string;
    isError?: boolean;
    attachments?: ChatMessageAttachment[];
}) {
    const containerClass = clsx(
        "max-w-[90%] w-fit rounded-md py-4 pr-4 text-[14px] leading-6",
        isError ? "bg-red-100 text-red-800 border border-red-300 rounded-2xl pl-4" : "text-slate-900"
    );
    const hasAttachments = (attachments?.length ?? 0) > 0;

    return (
        <div className="flex justify-start">
            <div className={containerClass}>
                {title && <div className="text-[12px] font-semibold mb-2">{title}</div>}
                <div className="flex flex-col gap-3">
                    {isError ? (
                        <div className="text-lg whitespace-pre-wrap break-words overflow-x-hidden text-red-800">
                            {text}
                        </div>
                    ) : (
                        <MarkdownRenderer
                            content={text}
                            className="text-lg leading-relaxed text-oxford-blue break-words"
                        />
                    )}
                    {hasAttachments && (
                        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200">
                            {attachments!.map(attachment => (
                                <AttachmentBadge key={attachment.id} attachment={attachment}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function MessageItem({message}: { message: ChatMessage }) {
    if (message.role === "user") {
        return <UserMessageBubble text={message.text} attachments={message.attachments}/>;
    }
    return (
        <AssistantMessagePanel
            text={message.text}
            title={message.title}
            isError={message.isError}
            attachments={message.attachments}
        />
    );
}
