import React from "react";
import {AdminLayoutModuleConfig} from "@common/_scaffolder/AdminLayoutModuleConfig.ts";
import AtomIcon from "@common/assets/dashboard/atom-icon.svg?react";
import {AiConfigurationPage} from "@ai/pages/AiConfigurationPage.tsx";
import {AiAgentProvidersSettingsSection} from "@ai/components/settings/AiAgentProvidersSettingsSection.tsx";
import {AiAgentChatsSection} from "@ai/components/settings/AiAgentChatsSection.tsx";
import {UpdateAiAgentFormSection} from "@ai/components/settings/UpdateAiAgentFormSection.tsx";
import AiAgentSessionStatsTable from "@ai/components/settings/AiAgentSessionStatsTable.tsx";
import {AiAgentChatSessionsPage} from "@ai/components/sessions/AiAgentChatSessionsPage.tsx";
import SessionConversationDetailsPage from "@ai/components/sessions/SessionConversationDetailsPage.tsx";

const breadcrumbsLabels: Record<string, string> = {
    aisettings: "AI Configuration",
    agents: "Assistants",
    sessions: "Sessions",
};

const routes = [
    {
        path: "aisettings",
        element: <AiConfigurationPage/>, // wrapper with Tabs
        children: [
            {index: true, element: <AiConfigurationPage/>},
            {path: "settings", element: <AiAgentProvidersSettingsSection/>},
            {path: "agents/:id/chats", element: <AiAgentChatsSection/>},
            {path: "agents/:id", element: <UpdateAiAgentFormSection/>},
            {path: "sessions", element: <AiAgentSessionStatsTable/>},
        ],
    },
    {path: "aisettings/sessions/agents", element: <AiAgentSessionStatsTable/>},
    {path: "aisettings/sessions/agents/:id", element: <AiAgentChatSessionsPage/>},
    {path: "aisettings/sessions/agents/:agentId/:sessionId", element: <SessionConversationDetailsPage/>},
];

const sidebarItems = [
    {path: "admin/aisettings", icon: AtomIcon, children: "AI configuration"},
] as AdminLayoutModuleConfig["sidebarItems"];

export const aiAdminLayoutConfig: AdminLayoutModuleConfig = {
    breadcrumbsLabels,
    routes,
    sidebarItems,
};
