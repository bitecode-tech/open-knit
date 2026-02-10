export interface AiAgentChatResponse {
    message?: string,
    error?: string,
    files?: {
        id?: string;
        name?: string;
        size?: number;
        mimeType?: string;
        downloadUrl?: string;
    }[]
}
