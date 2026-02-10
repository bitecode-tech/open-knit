import {createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import AdminAiService from "@ai/services/AdminAiService.ts";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import {AiAgent} from "@ai/types/AiAgent.ts";
import {useLocation, useNavigate} from "react-router-dom";

interface AiAgentsContextValue {
    readonly agentConfigs: AiAgent[]
    readonly selectedAgent: AiAgent | null
    setSelectedAgent: (agent: AiAgent | null) => void,
    setFutureSelectedAgent: Dispatch<SetStateAction<AiAgent | null>>,
    readonly invalidateQuery: string[],
}

const AiAgentsContext = createContext<AiAgentsContextValue | undefined>(undefined);

export function useAiAgents() {
    const context = useContext(AiAgentsContext);
    if (!context) {
        throw new Error("useAiAgents must be used inside AiAgentsProvider");
    }
    return context;
}

interface AiAgentsProviderProps {
    children: ReactNode
}

export function AiAgentsProvider({children}: AiAgentsProviderProps) {
    const [selectedAgent, setSelectedAgent] = useState<AiAgent | null>(null);
    const [futureSelectedAgent, setFutureSelectedAgent] = useState<AiAgent | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const {data: agentConfigs} = useQuery({
        queryKey: AdminAiService.QUERY_KEYS.GET_AGENTS(0, 999),
        queryFn: async () => {
            const agentsResp = await AdminAiClient.getAgents({
                page: {page: 0, size: 999, sort: [{property: "createdDate", direction: "ASC"}]}
            });
            return agentsResp.content;
        }
    });

    useEffect(() => {
        if (!agentConfigs || agentConfigs.length === 0) {
            return
        }

        // just to handle new agents
        if (futureSelectedAgent) {
            const foundAiAgent = agentConfigs.find(agent => agent.uuid === futureSelectedAgent.uuid)
            if (!!foundAiAgent) {
                setSelectedAgent(foundAiAgent)
                setFutureSelectedAgent(null)
                navigate(`/admin/aisettings/agents/${foundAiAgent.uuid}`)
                return;
            }
        }

        // read last path segment
        const segments = location.pathname.split("/").filter(Boolean);
        const maybeId = segments[segments.length - 1];
        const isUuid = maybeId && /^[0-9a-f-]{36}$/.test(maybeId);

        if (!selectedAgent && !isUuid) {
            setSelectedAgent(agentConfigs[0]);
        }
    }, [agentConfigs, selectedAgent, location]);


    return (
        <AiAgentsContext.Provider
            value={{agentConfigs: agentConfigs ?? [], selectedAgent, setSelectedAgent, invalidateQuery: AdminAiService.QUERY_KEYS.GET_AGENTS_INVALIDATE(), setFutureSelectedAgent}}>
            {children}
        </AiAgentsContext.Provider>
    );
}
