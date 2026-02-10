import React from "react";
import {baseConfig} from "@common/config/AxiosConfig.ts";
import DefaultUserConfigurableChat, {
    type ChatMessage,
    type ChatMessageResponse,
    type UserConfigurableChatProps as DefaultUserConfigurableChatProps,
} from "@ai/components/chat/user-configurable-chat/chat-provider/UserConfigurableChatDefault.tsx";
import ChatkitChat from "@ai/components/chat/user-configurable-chat/chat-provider/ChatkitChat.tsx";

export type {ChatMessage, ChatMessageResponse};

export interface UserConfigurableChatProps extends DefaultUserConfigurableChatProps {
    /**
     * Endpoint that returns a ChatKit `client_secret`.
     * When absent, the component will fall back to the legacy chat.
     */
    chatKitClientSecretUrl?: string;
    /** ChatKit domain key used to validate requests against your backend. */
    chatKitDomainKey?: string;
    /** Base URL for a custom ChatKit API. Defaults to the configured Axios base URL. */
    chatKitApiUrl?: string;
    /** Forces chat implementation; defaults to ChatKit when available. */
    chatImplementation?: "chatkit" | "legacy";
    /** Workflow ID used by ChatKit; required when chatImplementation is ChatKit. */
    chatKitWorkflowId?: string;
}

export {DefaultUserConfigurableChat};

export default function UserConfigurableChat(props: UserConfigurableChatProps) {
    const {
        quickReplies = [],
        placeholder = "",
        header = "",
        fileUploadEnabled = true,
        height = "80dvh",
        hideHeader = false,
        inputMaxWidth,
        chatImplementation = "chatkit",
        chatKitWorkflowId,
    } = props;

    // Always point to our backend; optional per-instance override via props.
    const clientSecretUrl =
        props.chatKitClientSecretUrl
        ?? `${String(baseConfig.baseURL).replace(/\/$/, "")}/chatkit/session`;
    const domainKey = props.chatKitDomainKey ?? "local-dev";
    const apiUrl = props.chatKitApiUrl ?? baseConfig.baseURL ?? "";

    const shouldUseChatKit = chatImplementation === "chatkit";
    const hasWorkflowId = Boolean(chatKitWorkflowId?.trim());

    if (!shouldUseChatKit || !hasWorkflowId) {
        return <DefaultUserConfigurableChat {...props} />;
    }

    return (
        <ChatkitChat
            quickReplies={quickReplies}
            placeholder={placeholder}
            header={header}
            fileUploadEnabled={fileUploadEnabled}
            height={height}
            hideHeader={hideHeader}
            inputMaxWidth={inputMaxWidth}
            chatKitClientSecretUrl={clientSecretUrl}
            chatKitApiUrl={apiUrl}
            chatKitDomainKey={domainKey}
            chatKitWorkflowId={chatKitWorkflowId}
            fallbackRender={() => <DefaultUserConfigurableChat {...props} />}
        />
    );
}
