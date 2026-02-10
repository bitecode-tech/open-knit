package bitecode.modules.ai.model.data.projection;

import java.time.Instant;
import java.util.UUID;

public record AgentChatSession(
        UUID sessionUuid,
        Long sessionId,
        String overview,
        Instant createdDate,
        Long durationSeconds,
        Long prompts
) {
}
