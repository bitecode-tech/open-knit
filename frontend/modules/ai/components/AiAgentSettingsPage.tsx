import {UpdateAiAgentFormSection} from "@ai/components/settings/UpdateAiAgentFormSection.tsx";
import React, {useEffect, useRef, useState} from "react";
import {TabItem, Tabs, TabsRef} from "flowbite-react";
import {AiAgentsProvider, useAiAgents} from "@ai/contexts/AiAgentsContext.tsx";
import {AiAgentProvidersSettingsSection} from "@ai/components/settings/AiAgentProvidersSettingsSection.tsx";
import AiAgentSessionStatsTable from "@ai/components/settings/AiAgentSessionStatsTable.tsx";
import {AiAgentChatsSection} from "@ai/components/settings/AiAgentChatsSection.tsx";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {ShareAiAgentLinkSideModal} from "@ai/components/settings/ShareAiAgentLinkSideModal.tsx";
import {AiSettingsActiveTabProvider} from "@ai/contexts/AiSettingsActiveTabContext.tsx";
import {useLocation, useNavigate, useParams} from "react-router-dom";

export function AiAgentSettingsPage() {
    return (
        <AiAgentsProvider>
            <SettingsPageContent/>
        </AiAgentsProvider>
    );
}

function SettingsPageContent() {
    const [showShareModal, setShowShareModalModal] = useState(false)
    const tabsRef = useRef<TabsRef>(null);
    const {selectedAgent, agentConfigs} = useAiAgents();
    const location = useLocation();
    const navigate = useNavigate();
    const {id: agentId} = useParams<{ id: string }>();

    const activeTab = (() => {
        if (location.pathname.includes("/chats")) return 0;
        if (location.pathname.includes("/sessions")) return 1;
        if (location.pathname.includes("/agents/")) return 2;
        if (location.pathname.includes("/settings")) return 3;
        return 0;
    })();

    useEffect(() => {
        tabsRef.current?.setActiveTab(activeTab);
    }, [activeTab]);

    useEffect(() => {
        if (
            location.pathname === "/admin/aisettings" &&
            agentConfigs &&
            agentConfigs.length > 0
        ) {
            navigate(`/admin/aisettings/agents/${agentConfigs[0].uuid}`, {
                replace: true,
            });
        }
    }, [location.pathname, agentConfigs, navigate]);


    const handleTabChange = (tabIndex: number) => {
        switch (tabIndex) {
            case 0: { // Chat
                const id = agentId ?? selectedAgent?.uuid ?? agentConfigs?.[0]?.uuid;
                if (id) {
                    navigate(`/admin/aisettings/agents/${id}/chats`);
                }
                break;
            }
            case 1: // History
                navigate("/admin/aisettings/sessions");
                break;
            case 2: { // Configuration
                const id = agentId ?? selectedAgent?.uuid ?? agentConfigs?.[0]?.uuid;
                if (id) {
                    navigate(`/admin/aisettings/agents/${id}`);
                }
                break;
            }
            case 3: // Settings
                navigate("/admin/aisettings/settings");
                break;
        }
    };

    return (
        <AiSettingsActiveTabProvider value={{activeTab, setActiveTab: handleTabChange}}>
            <div className="flex flex-col gap-y-4 h-full mb-0">
                <div className="relative">
                    <h2 className="text-gray-900 text-xl font-semibold">AI assistant</h2>
                    {(activeTab === 0 || activeTab === 2) && (
                        <GenericButton
                            size="sm"
                            className="absolute right-0"
                            onClick={() => setShowShareModalModal(true)}
                        >
                            Share
                        </GenericButton>
                    )}
                </div>
                <Tabs
                    variant="underline"
                    onActiveTabChange={handleTabChange}
                    ref={tabsRef}
                >
                    <TabItem title="Chat">
                        <AiAgentChatsSection/>
                    </TabItem>
                    <TabItem title="Sessions">
                        <AiAgentSessionStatsTable/>
                    </TabItem>
                    <TabItem title="Configuration">
                        <UpdateAiAgentFormSection/>
                    </TabItem>
                    <TabItem title="Settings">
                        <AiAgentProvidersSettingsSection/>
                    </TabItem>
                </Tabs>
            </div>

            <ShareAiAgentLinkSideModal
                showState={[showShareModal, setShowShareModalModal]}
            />
        </AiSettingsActiveTabProvider>
    );
}
