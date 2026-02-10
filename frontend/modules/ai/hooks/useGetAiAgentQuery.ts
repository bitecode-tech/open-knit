import {useQuery, UseQueryResult} from "@tanstack/react-query";
import AdminAiService from "@ai/services/AdminAiService.ts";
import AdminAiClient from "@ai/clients/AdminAiClient.ts";
import {ExistingFile} from "@common/components/forms/GenericFormMultiFileInput.tsx";
import {AiAgent} from "@ai/types/AiAgent.ts";

export interface AiAgentMappedConfigData extends Omit<AiAgent, "documents" | "exemplaryPrompts"> {
    documents: ExistingFile[]
    exemplaryPrompts: string[]
    newDocuments: File[],
}

export default function useGetAiAgentQuery(uuid?: string): UseQueryResult<AiAgentMappedConfigData> {
    return useQuery({
        queryKey: AdminAiService.QUERY_KEYS.GET_AGENT(uuid!),
        queryFn: async () => {
            const agentConfigData = await AdminAiClient.getAgent(uuid!)
            const {
                name = "",
                systemMessage = "",
                exemplaryPrompts = [],
                testMode,
                documents = [],
                model = "",
                visionModel = "",
                recordingModel = "",
                inputPlaceholder = "",
                title = "",
                provider = "",
                temperature = null,
                topP = null,
                maxTokens = null,
                presencePenalty = null,
                frequencyPenalty = null,
                shortTermMemoryLastMessages = null,
                fileUploadEnabled = true,
                recordingEnabled = false,
                chatUi = "DEFAULT",
                chatkitWorkflowId = null
            } = agentConfigData;

            return {
                name,
                systemMessage,
                exemplaryPrompts: exemplaryPrompts.map(({prompt}) => prompt),
                documents: documents.map(({uuid, documentName, sizeBytes}) => ({id: uuid, name: documentName, sizeBytes})),
                testMode,
                newDocuments: [],
                title,
                inputPlaceholder,
                model,
                visionModel,
                recordingModel,
                provider,
                temperature,
                topP,
                maxTokens,
                presencePenalty,
                frequencyPenalty,
                shortTermMemoryLastMessages,
                fileUploadEnabled,
                recordingEnabled,
                chatUi,
                chatkitWorkflowId
            };
        },
        enabled: !!uuid
    });
}
