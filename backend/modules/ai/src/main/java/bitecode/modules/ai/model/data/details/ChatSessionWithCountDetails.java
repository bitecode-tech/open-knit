package bitecode.modules.ai.model.data.details;

public record ChatSessionWithCountDetails(
        Long id,
        String externalSessionId,
        long messagesCount
) {
}
