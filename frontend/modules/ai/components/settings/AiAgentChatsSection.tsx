import React, {type Dispatch, type SetStateAction, useCallback, useMemo, useState} from "react";
import AiAgentsList from "@ai/components/settings/AiAgentsList.tsx";
import {useAiAgents} from "@ai/contexts/AiAgentsContext.tsx";
import UserConfigurableChat, {ChatMessage} from "@ai/components/chat/user-configurable-chat/UserConfigurableChat.tsx";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import {v4 as uuidv4} from "uuid";

export function AiAgentChatsSection() {
    const {selectedAgent} = useAiAgents();
    const getConversation = useConversations();
    const agentId = selectedAgent?.uuid ?? "";
    const {messagesState, sessionId} = getConversation(agentId);
    const provider = selectedAgent?.provider;
    const chatImplementation = provider === "OPEN_AI" && selectedAgent?.chatUi === "CHATKIT"
        ? "chatkit"
        : "legacy";

    const handleSend = useCallback(async (message: string, attachments: File[]) => {
        if (!selectedAgent) {
            return {error: "No AI assistant selected"};
        }
        try {
            return await AdminAiClient.chat(selectedAgent.uuid, message, sessionId, attachments);
        } catch (error) {
            console.error("Admin chat request failed", error);
            return {error: "Failed to send message"};
        }
    }, [selectedAgent, sessionId]);

    const handleTranscribeRecording = useCallback(async (file: File) => {
        if (!selectedAgent) {
            return "";
        }
        try {
            return await AdminAiClient.transcribeRecording(selectedAgent.uuid, file);
        } catch (error) {
            console.error("Admin transcription failed", error);
            return "";
        }
    }, [selectedAgent]);

    return (
        <section className="grid grid-cols-6 h-full">
            <AiAgentsList setNavigateUrl={(agentId) => `agents/${agentId}/chats`}/>
            <div className="flex col-span-5 ml-9 gap-x-12 w-full max-w-3xl max-h-[500px]">
                <UserConfigurableChat
                    header={selectedAgent?.title}
                    height="70dvh"
                    hideHeader
                    inputOffset={"30dvh"}
                    messagesState={messagesState}
                    placeholder={selectedAgent?.inputPlaceholder}
                    quickReplies={selectedAgent?.exemplaryPrompts?.map(({prompt}) => prompt)}
                    fileUploadEnabled={selectedAgent?.fileUploadEnabled !== false}
                    recordingEnabled={selectedAgent?.recordingEnabled === true}
                    chatImplementation={chatImplementation}
                    chatKitWorkflowId={selectedAgent?.chatkitWorkflowId}
                    onSend={handleSend}
                    onTranscribeRecording={selectedAgent?.recordingEnabled ? handleTranscribeRecording : undefined}
                />
            </div>
        </section>
    );
}

function useConversations() {
    const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>({});
    const sessionIds = useMemo(() => ({} as Record<string, string>), []);

    function ensureSessionId(agentId: string): string {
        if (!sessionIds[agentId]) {
            sessionIds[agentId] = uuidv4();
        }
        return sessionIds[agentId];
    }

    function getConversation(agentId: string): { messagesState: [ChatMessage[], Dispatch<SetStateAction<ChatMessage[]>>]; sessionId: string } {
        const messages = conversations[agentId] ?? [];
        const setMessages: Dispatch<SetStateAction<ChatMessage[]>> = (updater) => {
            setConversations(prev => {
                const prevMessages = prev[agentId] ?? [];
                const nextMessages = typeof updater === "function" ? (updater as any)(prevMessages) : updater;
                return {...prev, [agentId]: nextMessages};
            });
        };
        return {
            messagesState: [messages, setMessages],
            sessionId: ensureSessionId(agentId),
        };
    }

    return getConversation;
}
