class AdminAiService {
    public QUERY_KEYS = {
        GET_AGENT: (uuid: string) => ['ai-agent', uuid] as const,
        GET_AGENT_SESSIONS_STATS: (pageSize: number, pageNumber: number, filters?: Object) => ['ai-agents-sessions-stats', pageSize, pageNumber, JSON.stringify(filters)] as const,
        GET_PROVIDER_CONFIG: (uuid: string) => ['ai-agent-provider-config', uuid] as const,
        GET_PROVIDERS_CONFIG: (uuid: string) => ['ai-agent-providers-config', uuid] as const,
        GET_AGENTS: (pageSize: number, pageNumber: number) => ['ai-agents', pageSize, pageNumber] as const,

        GET_CHAT_SESSIONS: (agentId: string, pageSize: number, pageNumber: number, filters?: Object) => ['ai-chat-sessions', agentId, pageSize, pageNumber, JSON.stringify(filters)],
        GET_CHAT_SESSION_STATS: (sessionId: string) => ['ai-chat-session-stats', sessionId],
        GET_CHAT_SESSION_MESSAGES: (sessionId: string, pageSize: number, pageNumber: number) => ['ai-chat-session-messages', sessionId, pageSize, pageNumber],

        GET_AGENTS_INVALIDATE: () => ['ai-agents'],
        GET_PROVIDER_INVALIDATE: () => ['ai-agent-provider']
    }
}

export default new AdminAiService();