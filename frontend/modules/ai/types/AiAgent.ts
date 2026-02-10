import {AiAgentDocument} from "@ai/types/AiAgentDocument.ts";
import {AiAgentExemplaryPrompt} from "@ai/types/AiAgentExemplaryPrompt.ts";

export interface AiAgent {
    uuid: string,
    name: string,
    title?: string,
    systemMessage?: string,
    inputPlaceholder?: string,
    accessPassword?: string,
    accessPasswordEnabled: boolean,
    provider: string,
    model?: string,
    visionModel?: string,
    recordingModel?: string,
    temperature?: number | null,
    topP?: number | null,
    maxTokens?: number | null,
    presencePenalty?: number | null,
    frequencyPenalty?: number | null,
    shortTermMemoryLastMessages?: number | null,
    testMode: boolean,
    fileUploadEnabled: boolean,
    recordingEnabled?: boolean,
    chatUi?: "DEFAULT" | "CHATKIT",
    chatkitWorkflowId?: string,
    documents: AiAgentDocument[]
    exemplaryPrompts: AiAgentExemplaryPrompt[]
}
