import {AxiosInstance} from "axios";
import {adminBaseConfig} from "@common/config/AxiosConfig.ts";
import AuthService from "@identity/auth/services/AuthService.ts";
import {AiAgent} from "@ai/types/AiAgent.ts";
import {PagedRequest} from "@common/model/PagedRequest.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {AiAgentDocument} from "@ai/types/AiAgentDocument.ts";
import {UpdateAiAgentConfigRequest} from "@ai/types/request/UpdateAiAgentConfigRequest.ts";
import {UpdateAiServicesProviderConfig} from "@ai/types/request/UpdateAiServicesProviderConfig.ts";
import {AiServicesProviderConfig} from "@ai/types/AiServicesProviderConfig.ts";
import {AiAgentChatResponse} from "@ai/types/response/AiAgentChatResponse.ts";
import {AudioTranscriptionResponse} from "@ai/types/response/AudioTranscriptionResponse.ts";
import {axiosRequestConfigOf} from "@common/utils/PaginationUtils.ts";
import {AiAgentChatSession} from "@ai/types/AiAgentChatSession.ts";
import {AiAgentSessionsStats} from "@ai/types/AiAgentSessionsStats.ts";
import {AiAgentSessionMessage} from "@ai/types/AiAgentSessionMessage.ts";
import {AiAgentChatSessionStats} from "@ai/types/AiAgentChatSessionStats.ts";

class AdminAiClient {
    private axios: AxiosInstance;

    constructor() {
        this.axios = AuthService.createAuthenticatedClientInstance(adminBaseConfig, "/ai");
    }

    async getAgent(agentName: string): Promise<AiAgent> {
        const response = await this.axios.get<AiAgent>(`/agents/${agentName}`)
        return response.data
    }

    async createAgent(): Promise<AiAgent> {
        const response = await this.axios.post<AiAgent>(`/agents`)
        return response.data
    }

    async deleteAgent(agentId: string): Promise<void> {
        await this.axios.delete<AiAgent>(`/agents/${agentId}`)
    }

    async getAgents(request: PagedRequest<void>): Promise<PagedResponse<AiAgent>> {
        const response = await this.axios.get<PagedResponse<AiAgent>>(`/agents`, axiosRequestConfigOf(request))
        return response.data
    }

    async updateAgentConfig(agentName: string, request: UpdateAiAgentConfigRequest): Promise<AiAgent> {
        const response = await this.axios.patch<AiAgent>(`/agents/${agentName}`, request)
        return response.data
    }

    async getAiServicesProviderConfigs(): Promise<AiServicesProviderConfig[]> {
        const response = await this.axios.get<AiServicesProviderConfig[]>(`/providers`)
        return response.data
    }

    async getAiServicesProviderConfig(provider: string): Promise<AiServicesProviderConfig> {
        const response = await this.axios.get<AiServicesProviderConfig>(`/providers/${provider}`)
        return response.data
    }

    async updateAiServicesProviderConfig(request: UpdateAiServicesProviderConfig): Promise<AiAgent> {
        const response = await this.axios.patch<AiAgent>(`/providers`, request)
        return response.data
    }

    async getDocuments(agentName: string, request: PagedRequest<void>): Promise<PagedResponse<AiAgentDocument>> {
        const response = await this.axios.get<PagedResponse<AiAgentDocument>>(
            `/agents/${agentName}/knowledge`,
            {
                params: {
                    ...request.page,
                    ...request.params
                }
            }
        )
        return response.data
    }

    async updateDocuments(agentName: string, remainingDocumentsIds: string[]): Promise<void> {
        await this.axios.patch(`/agents/${agentName}/knowledge`, remainingDocumentsIds)
    }

    async addDocuments(agentName: string, files: File[]): Promise<void> {
        const formData = new FormData()
        for (const file of files) {
            formData.append('files', file)
        }
        await this.axios.post(
            `/agents/${agentName}/knowledge`,
            formData,
            {headers: {'Content-Type': 'multipart/form-data'}}
        )
    }

    async removeDocument(agentName: string, id: string): Promise<void> {
        await this.axios.delete(
            `/agents/${agentName}/knowledge/${id}`
        )
    }

    async chat(agentName: string, prompt: string, sessionId: string | number, attachments?: File[]): Promise<AiAgentChatResponse> {
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("sessionId", String(sessionId));
        attachments?.forEach((file) => formData.append("files", file));

        const response = await this.axios.post<AiAgentChatResponse>(`/agents/${agentName}/chat`, formData, {
            timeout: 120_000,
            headers: {'Content-Type': 'multipart/form-data'}
        })
        return response.data
    }

    async transcribeRecording(agentName: string, recording: File): Promise<string> {
        const formData = new FormData();
        formData.append("recording", recording);
        const response = await this.axios.post<AudioTranscriptionResponse>(
            `/agents/${agentName}/chat/transcribe`,
            formData,
            {headers: {'Content-Type': 'multipart/form-data'}}
        );
        return response.data.transcript ?? "";
    }

    async getChatSessions(agentId: string, request: PagedRequest<void>): Promise<PagedResponse<AiAgentChatSession>> {
        const response = await this.axios.get<PagedResponse<AiAgentChatSession>>(`/agents/${agentId}/sessions`, axiosRequestConfigOf(request))
        return response.data
    }

    async getChatSessionStats(sessionId: string): Promise<AiAgentChatSessionStats> {
        const response = await this.axios.get<AiAgentChatSessionStats>(`/agents/sessions/${sessionId}/stats`)
        return response.data
    }

    async getChatSessionMessages(sessionId: string, request: PagedRequest<void>): Promise<PagedResponse<AiAgentSessionMessage>> {
        const response = await this.axios.get<PagedResponse<AiAgentSessionMessage>>(`/agents/sessions/${sessionId}/messages`, axiosRequestConfigOf(request))
        return response.data
    }

    async getAiAgentSessionStats(request: PagedRequest<void>): Promise<PagedResponse<AiAgentSessionsStats>> {
        const response = await this.axios.get<PagedResponse<AiAgentSessionsStats>>(`/agents/sessions/stats`, axiosRequestConfigOf(request))
        return response.data
    }
}

export default new AdminAiClient();
