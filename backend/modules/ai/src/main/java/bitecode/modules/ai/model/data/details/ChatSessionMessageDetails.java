package bitecode.modules.ai.model.data.details;

import bitecode.modules.ai.model.enums.ChatMessageUserType;

public record ChatSessionMessageDetails(
        String message,
        ChatMessageUserType type
) {

}
