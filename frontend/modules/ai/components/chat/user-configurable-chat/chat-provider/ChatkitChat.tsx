import React, {useEffect, useMemo, useState} from "react";
import {ChatKit, useChatKit} from "@openai/chatkit-react";
import type {ChatKitOptions} from "@openai/chatkit";
import {baseConfig} from "@common/config/AxiosConfig.ts";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import NoAuthAiClient from "@ai/clients/NoAuthAiClient.ts";

const CHATKIT_SCRIPT_SRC = "https://cdn.platform.openai.com/deployments/chatkit/chatkit.js";
const DEFAULT_ATTACHMENTS_LIMITS = {
    maxCount: 5,
    maxSize: 10_485_760,
} as const;

type ScriptStatus = "idle" | "loading" | "ready" | "error";

function useChatKitScript(enabled: boolean): ScriptStatus {
    const [status, setStatus] = useState<ScriptStatus>(() => (enabled ? "loading" : "error"));

    useEffect(() => {
        if (!enabled || typeof window === "undefined") {
            setStatus("error");
            return;
        }

        if (customElements.get("openai-chatkit")) {
            setStatus("ready");
            return;
        }

        const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHATKIT_SCRIPT_SRC}"]`);
        if (existing && existing.dataset.loaded === "true") {
            setStatus("ready");
            return;
        }

        const script = existing ?? document.createElement("script");
        script.src = CHATKIT_SCRIPT_SRC;
        script.async = true;

        const handleLoad = () => {
            script.dataset.loaded = "true";
            setStatus("ready");
        };
        const handleError = () => setStatus("error");

        script.addEventListener("load", handleLoad);
        script.addEventListener("error", handleError);

        if (!existing) {
            document.body.appendChild(script);
        }

        return () => {
            script.removeEventListener("load", handleLoad);
            script.removeEventListener("error", handleError);
        };
    }, [enabled]);

    return status;
}

export interface ChatkitChatProps {
    quickReplies?: string[];
    placeholder?: string;
    header?: string;
    fileUploadEnabled?: boolean;
    height?: string | number;
    hideHeader?: boolean;
    inputMaxWidth?: string | number;
    chatKitClientSecretUrl?: string;
    chatKitDomainKey?: string;
    chatKitApiUrl?: string;
    chatKitWorkflowId?: string;
    fallbackRender?: () => React.ReactNode;
}

export default function ChatkitChat({
                                        quickReplies = [],
                                        placeholder = "",
                                        header = "",
                                        fileUploadEnabled = true,
                                        height = "80dvh",
                                        hideHeader = false,
                                        inputMaxWidth,
                                        chatKitClientSecretUrl,
                                        chatKitDomainKey,
                                        chatKitApiUrl,
                                        chatKitWorkflowId,
                                        fallbackRender,
                                    }: ChatkitChatProps) {
    const clientSecretUrl =
        chatKitClientSecretUrl ?? `${String(baseConfig.baseURL).replace(/\/$/, "")}/chatkit/session`;
    const domainKey = chatKitDomainKey ?? "local-dev";
    const apiUrl = chatKitApiUrl ?? baseConfig.baseURL ?? "";

    const hasWorkflowId = Boolean(chatKitWorkflowId?.trim());
    const enableChatKit = Boolean(clientSecretUrl) && hasWorkflowId;
    const scriptStatus = useChatKitScript(enableChatKit);
    const [clientSecretError, setClientSecretError] = useState<string | null>(null);

    const fetchClientSecret = useMemo(() => {
        if (!enableChatKit || !clientSecretUrl) return null;
        return async (existingClientSecret?: string | null) => {
            try {
                const payload: Record<string, unknown> = existingClientSecret ? {client_secret: existingClientSecret} : {};
                if (chatKitWorkflowId) {
                    payload["workflow_id"] = chatKitWorkflowId;
                }
                const {response, error} = await NoAuthAiClient.createChatkitSession(clientSecretUrl, payload);

                if (error || !response) {
                    const status = error?.response?.status;
                    throw new Error(status ? `Client secret request failed (${status})` : "Client secret request failed");
                }
                const data = response.data ?? {};
                const secret: unknown = (data as any)?.client_secret ?? (data as any)?.clientSecret;
                if (!secret || typeof secret !== "string") {
                    throw new Error("Missing client_secret in response");
                }
                setClientSecretError(null);
                return secret;
            } catch (error) {
                const message = (error as Error)?.message ?? "Failed to fetch ChatKit client secret";
                setClientSecretError(message);
                throw error;
            }
        };
    }, [chatKitWorkflowId, clientSecretUrl, enableChatKit]);

    useEffect(() => {
        if (!clientSecretError) return;
        showToast("error", "ChatKit authentication failed. Falling back to the legacy chat UI.");
    }, [clientSecretError]);

    const startScreenPrompts = useMemo(
        () =>
            (quickReplies ?? [])
                .map(prompt => prompt?.trim())
                .filter((prompt): prompt is string => Boolean(prompt))
                .map(prompt => ({label: prompt, prompt})),
        [quickReplies]
    );

    const chatKitOptions = useMemo<ChatKitOptions>(() => {
        const api: ChatKitOptions["api"] = fetchClientSecret
            ? {getClientSecret: fetchClientSecret}
            : {url: apiUrl, domainKey: domainKey || "local-dev"};

        return {
            api,
            header: {enabled: !hideHeader, title: {text: header || "Chat"}},
            history: {enabled: false},
            composer: {
                placeholder: placeholder?.trim() || undefined,
                attachments: {
                    enabled: fileUploadEnabled !== false,
                    ...DEFAULT_ATTACHMENTS_LIMITS,
                }
            },
            startScreen: startScreenPrompts.length
                ? {prompts: startScreenPrompts}
                : undefined,
            theme: {
                colorScheme: "light",
                typography: {
                    baseSize: 16,
                    fontFamily: 'Inter, sans-serif',
                    fontSources: [
                        {
                            family: 'Inter',
                            src: 'https://rsms.me/inter/font-files/Inter-Regular.woff2',
                            weight: 400,
                            style: 'normal'
                        }
                        // ...and 3 more font sources
                    ]
                },
                color: {
                    surface: {
                        background: "#F9FAFB",
                        foreground: "#FFFFFF",
                    },
                },
            },
        };
    }, [
        apiUrl,
        domainKey,
        fetchClientSecret,
        fileUploadEnabled,
        header,
        hideHeader,
        placeholder,
        startScreenPrompts,
    ]);

    const resolvedHeight = useMemo(() => (typeof height === "number" ? `${height}px` : height), [height]);
    const resolvedMaxWidth = useMemo(
        () => (typeof inputMaxWidth === "number" ? `${inputMaxWidth}px` : inputMaxWidth),
        [inputMaxWidth]
    );

    const {control} = useChatKit(chatKitOptions);

    if (!enableChatKit || clientSecretError || scriptStatus === "error") {
        return fallbackRender ? <>{fallbackRender()}</> : null;
    }
    if (scriptStatus !== "ready") {
        return <div style={{width: "100%", maxWidth: resolvedMaxWidth, height: resolvedHeight ?? "80dvh"}}/>;
    }

    return (
        <div style={{width: "100%", maxWidth: resolvedMaxWidth}}>
            <ChatKit control={control} style={{
                width: "100%",
                height: resolvedHeight ?? "80dvh",
            }}/>
        </div>
    );
}
