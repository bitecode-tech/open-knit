import {List, ListItem} from "flowbite-react";
import {Plus} from "flowbite-react-icons/outline";
import {useAiAgents} from "@ai/contexts/AiAgentsContext.tsx";
import React, {useEffect} from "react";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {showToast} from "@common/components/blocks/ToastManager.tsx";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import {GenericButton} from "@common/components/blocks/GenericButton.tsx";
import {useAiSettingsActiveTabContext} from "@ai/contexts/AiSettingsActiveTabContext.tsx";
import {useNavigate, useParams} from "react-router-dom";

interface AiAgentsListProps {
    setNavigateUrl: (agentId: string) => string;
}

export default function AiAgentsList({setNavigateUrl}: AiAgentsListProps) {
    const {agentConfigs, selectedAgent, setSelectedAgent, invalidateQuery, setFutureSelectedAgent} = useAiAgents();
    const {setActiveTab} = useAiSettingsActiveTabContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const {id: agentIdParam} = useParams<{ id: string }>();

    const {isPending, mutate} = useMutation({
        mutationFn: () => AdminAiClient.createAgent(),
        onSuccess: async (newAgent) => {
            await queryClient.invalidateQueries({queryKey: invalidateQuery});
            setFutureSelectedAgent(newAgent);
            setActiveTab(2);
        },
        onError: () => {
            showToast("error");
        },
    });

    useEffect(() => {
        if (!agentConfigs || agentConfigs.length === 0) return;

        if (agentIdParam) {
            const found = agentConfigs.find((a) => a.uuid === agentIdParam);

            if (found && found.uuid !== selectedAgent?.uuid) {
                setSelectedAgent(found);
            }

            return;
        }

    }, [agentIdParam, agentConfigs, selectedAgent, setSelectedAgent]);

    return (
        <section className="bg-gray-50 mr-auto space-y-4 p-4 w-full">
            <h2 className="text-gray-900 text-xl font-semibold">Assistants</h2>
            <List unstyled className="flex flex-col gap-2">
                {agentConfigs?.map((aiAgent) => (
                    <ListItem
                        key={aiAgent.uuid}
                        className={`${selectedAgent?.uuid === aiAgent.uuid ? "text-primary-700" : "text-gray-700"} 
                                  text-sm font-medium leading-tight hover:text-primary-700 bg-white
                                  px-3 py-2 m-0 rounded-lg mx-3 cursor-pointer 
                                  outline outline-1 outline-offset-[-1px] 
                                  ${selectedAgent?.uuid === aiAgent.uuid ? "outline-primary-700" : "outline-gray-200"} 
                                  hover:outline-primary-700 self-stretch flex items-center gap-2`}
                        onClick={() => navigate(setNavigateUrl(aiAgent.uuid))}
                    >
                        <span className="truncate min-w-0">{aiAgent.name}</span>
                    </ListItem>
                ))}
                <ListItem className="mx-3 cursor-pointer mt-2" onClick={() => mutate()}>
                    <GenericButton
                        isPending={isPending}
                        childrenLoaderWrap
                        color="alternative"
                        size="sm"
                        className="w-full"
                    >
                        <Plus size={16}/> New
                    </GenericButton>
                </ListItem>
            </List>
        </section>
    );
}
