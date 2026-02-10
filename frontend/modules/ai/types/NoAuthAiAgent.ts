export interface NoAuthAiAgent {
    uuid: string,
    name: string,
    title?: string,
    inputPlaceholder?: string,
    testMode?: string,
    exemplaryPrompts: string[],
    fileUploadEnabled: boolean,
    recordingEnabled?: boolean,
    provider?: string,
    chatUi?: "DEFAULT" | "CHATKIT",
    chatkitWorkflowId?: string,
}
