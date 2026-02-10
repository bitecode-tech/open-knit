package bitecode.modules.ai.model.data.projection;

import bitecode.modules.ai.model.entity.ChatSession;

public record ChatSessionWithUserMessageCount(
        ChatSession chatSession,
        long userMessageCount
) {

}