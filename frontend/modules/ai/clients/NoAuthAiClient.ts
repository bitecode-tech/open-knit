import axios, {AxiosInstance} from "axios";
import {addConverters, baseConfig} from "@common/config/AxiosConfig.ts";
import {NoAuthAiAgent} from "@ai/types/NoAuthAiAgent.ts";
import {AiAgentChatResponse} from "@ai/types/response/AiAgentChatResponse.ts";
import {AudioTranscriptionResponse} from "@ai/types/response/AudioTranscriptionResponse.ts";
import {axiosCallWrapper} from "@common/config/AxiosUtil.ts";

class NoAuthAiClient {
    private axios: AxiosInstance;

    constructor() {
        // For anonymous open endpoints used in iframes, do not send cookies across origins.
        this.axios = addConverters(axios.create({
            ...baseConfig,
            withCredentials: false,
            baseURL: baseConfig.baseURL + "/open/ai"
        }));
    }

    async validateAgentPassword(agentName: string, password?: string) {
        return axiosCallWrapper(() => this.axios.post<NoAuthAiAgent>(`/agents/${agentName}/password-check?password=${password}`));
    }

    async getAgent(agentName: string, password?: string) {
        return axiosCallWrapper(() => this.axios.get<NoAuthAiAgent>(`/agents/${agentName}?password=${password}`));
    }

    async chat(agentName: string, prompt: string, sessionId: string | number, password?: string, attachments?: File[]) {
        const formData = new FormData();
        formData.append("prompt", prompt);
        formData.append("sessionId", String(sessionId));
        if (password) {
            formData.append("password", password);
        }
        attachments?.forEach((file) => formData.append("files", file));

        return axiosCallWrapper(() => this.axios.post<AiAgentChatResponse>(`/agents/${agentName}/chat`, formData, {
            timeout: 120_000,
            headers: {'Content-Type': 'multipart/form-data'}
        }))
    }

    async transcribeRecording(agentName: string, recording: File, password?: string) {
        const formData = new FormData();
        formData.append("recording", recording);
        if (password) {
            formData.append("password", password);
        }
        return axiosCallWrapper(() => this.axios.post<AudioTranscriptionResponse>(`/agents/${agentName}/chat/transcribe`, formData, {
            timeout: 60_000,
            headers: {'Content-Type': 'multipart/form-data'}
        }));
    }

    async createChatkitSession(clientSecretUrl: string, payload: Record<string, unknown>) {
        return axiosCallWrapper<{ client_secret?: string; clientSecret?: string }>(() =>
            this.axios.post(clientSecretUrl, payload, {
                withCredentials: true,
                headers: {"Content-Type": "application/json"},
            })
        );
    }

    /**
     * Stream chat response using Server-Sent Events (SSE). Resolves when stream closes.
     */
    async chatStream(
        agentName: string,
        prompt: string,
        sessionId: string | number,
        password: string | undefined,
        onDelta: (chunk: string) => void,
    ): Promise<void> {
        const params = new URLSearchParams();
        params.set("prompt", prompt);
        params.set("sessionId", String(sessionId));
        if (password) params.set("password", password);

        const url = `${baseConfig.baseURL}/open/ai/agents/${encodeURIComponent(agentName)}/chat/stream?${params.toString()}`;
        return new Promise((resolve, reject) => {
            let source: EventSource | null = null;
            try {
                source = new EventSource(url, {withCredentials: false});
            } catch (e) {
                reject(e);
                return;
            }

            source.onmessage = (ev) => {
                if (ev?.data) {
                    onDelta(ev.data);
                }
            };

            source.onerror = () => {
                // EventSource fires error on normal close too; treat CLOSED as resolve
                if (source && (source.readyState === EventSource.CLOSED)) {
                    source.close();
                    resolve();
                } else {
                    source?.close();
                    resolve();
                }
            };
        });
    }

}

export default new NoAuthAiClient();
