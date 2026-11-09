package bitecode.modules.ai.model.data.request;

public record ChatkitSessionRequest(
        String clientSecret,
        String user,
        String workflowId
) {
}
