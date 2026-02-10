import React from "react";
import AiAgentChatSessionsTable from "@ai/components/sessions/AiAgentChatSessionsTable.tsx";
import {useParams} from "react-router-dom";

export function AiAgentChatSessionsPage() {
    const {id} = useParams<{ id: string }>();
    return <AiAgentChatSessionsTable agentId={id}/>;
}