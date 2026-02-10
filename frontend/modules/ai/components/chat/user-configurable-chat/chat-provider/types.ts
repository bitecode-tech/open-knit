import type {Dispatch, SetStateAction} from "react";

export type ChatMessageAttachment = {
    id: string;
    name: string;
    size?: number;
    mimeType?: string;
    downloadUrl?: string;
};

export interface ChatMessageResponse {
    message?: string;
    error?: string;
    files?: Array<Partial<ChatMessageAttachment> | null> | null;
}

export type ChatStreamConfig = {
    url: string;
    delayMs?: number;
    method?: "GET" | "POST";
    body?: BodyInit | null;
    headers?: Record<string, string>;
    withCredentials?: boolean;
};

export type ChatStreamResult = string | ChatStreamConfig | ChatMessageResponse | void;

export type AttachmentItem = {
    id: string;
    file: File;
};

export type ChatMessage = {
    id: string;
    role: "user" | "assistant";
    text: string;
    title?: string;
    isError?: boolean;
    attachments?: ChatMessageAttachment[];
};

export interface UserConfigurableChatProps {
    onSend?: (message: string, attachments: File[]) => Promise<ChatMessageResponse> | ChatMessageResponse;
    onStream?: (
        message: string,
        attachments: File[]
    ) => Promise<ChatStreamResult> | ChatStreamResult;
    header?: string;
    placeholder?: string;
    quickReplies?: string[];
    horizontalQuickReplies?: boolean;
    height?: string | number;
    onClose?: () => void;
    inputOffset?: string | number;
    headerOffset?: string | number;
    hideHeader?: boolean;
    inputMaxWidth?: string | number;
    messagesState?: [ChatMessage[], Dispatch<SetStateAction<ChatMessage[]>>] | null;
    fillBelowHeader?: boolean;
    fileUploadEnabled?: boolean;
    recordingEnabled?: boolean;
    enableCollapseExpand?: boolean;
    onTranscribeRecording?: (recording: File) => Promise<string | null | undefined>;
}
