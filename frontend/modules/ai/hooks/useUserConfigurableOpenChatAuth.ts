import {useEffect, useState} from "react";
import {SubmitHandler, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import NoAuthAiClient from "@ai/clients/NoAuthAiClient.ts";
import {baseConfig} from "@common/config/AxiosConfig.ts";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import {UserConfigurableChatProps} from "@ai/components/chat/user-configurable-chat/UserConfigurableChat.tsx";
import {v4 as uuidv4} from "uuid";

export interface FormInputs {
    password?: string;
}

const formSchema = z.object({
    password: z.string().optional(),
});

export function useUserConfigurableOpenChatAuth(agentId?: string) {
    const [props, setProps] = useState<UserConfigurableChatProps | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    // Generate a stable, non-empty sessionId at first render to avoid blank IDs in messages
    const [sessionId] = useState<string>(() => uuidv4());

    const {
        control,
        handleSubmit,
        formState: {errors},
        setError,
        getValues,
    } = useForm<FormInputs>({
        mode: "onBlur",
        resolver: zodResolver(formSchema),
        defaultValues: {password: ""},
    });

    async function setChatPropsOrRequireAuth(agentId: string, extra?: Partial<UserConfigurableChatProps>) {
        const resp = await NoAuthAiClient.getAgent(agentId, getValues().password);

        if (resp.error) {
            if (resp.error.status === 401) {
                setShowAuthModal(true);
            } else {
                console.error("Unknown error", resp.error);
            }
            return;
        }

        const {
            title,
            inputPlaceholder,
            exemplaryPrompts,
            fileUploadEnabled,
            recordingEnabled,
            provider,
            chatUi,
            chatkitWorkflowId,
        } = resp.response!.data;

        const chatImplementation = provider === "OPEN_AI" && chatUi === "CHATKIT" ? "chatkit" : "legacy";

        setProps({
            header: title,
            placeholder: inputPlaceholder,
            quickReplies: exemplaryPrompts,
            fileUploadEnabled: fileUploadEnabled !== false,
            recordingEnabled: recordingEnabled === true,
            chatImplementation,
            chatKitWorkflowId: chatkitWorkflowId,
            onSend: async (message, attachments) => {
                const resp = await NoAuthAiClient.chat(
                    agentId,
                    message,
                    sessionId!,
                    getValues().password,
                    attachments
                );
                if (resp.error) {
                    return resp?.error?.response?.data ?? {error: resp.error.message};
                }
                return resp.response!.data;
            },
            // Provide SSE URL; component manages streaming and chunk decoding
            onStream: async (message, attachments) => {
                const formData = new FormData();
                formData.append("prompt", message);
                formData.append("sessionId", String(sessionId!));
                const pw = getValues().password;
                if (pw) formData.append("password", pw);
                attachments.forEach(file => formData.append("files", file));
                return {
                    url: `${baseConfig.baseURL}/open/ai/agents/${encodeURIComponent(agentId)}/chat/stream`,
                    delayMs: 15,
                    method: "POST",
                    body: formData,
                };
            },
            onTranscribeRecording: async (recording) => {
                const resp = await NoAuthAiClient.transcribeRecording(
                    agentId,
                    recording,
                    getValues().password
                );
                if (resp.error) {
                    console.error("Transcription failed", resp.error);
                    return "";
                }
                return resp.response?.data?.transcript ?? "";
            },
            ...extra,
        });
    }

    async function validatePassword() {
        const resp = await NoAuthAiClient.validateAgentPassword(
            agentId!,
            getValues().password
        );
        if (resp.error) {
            if (resp.error.status === 401) {
                setError("password", {type: "manual", message: "Wrong password"});
                showToast("warning", "Wrong password");
            } else {
                setError("password", {type: "manual", message: "Try again later"});
                showToast("warning", "Try again later");
            }
        } else {
            await setChatPropsOrRequireAuth(agentId!);
            setShowAuthModal(false);
            showToast("success", "Successfully authenticated");
        }
    }

    useEffect(() => {
        if (!agentId) return;
        void setChatPropsOrRequireAuth(agentId);
    }, [agentId]);

    const onSubmit: SubmitHandler<FormInputs> = async () => {
        await validatePassword();
    };

    return {
        props,
        showAuthModal,
        setShowAuthModal,
        control,
        handleSubmit,
        errors,
        onSubmit,
        validatePassword,
        setChatPropsOrRequireAuth,
    };
}
