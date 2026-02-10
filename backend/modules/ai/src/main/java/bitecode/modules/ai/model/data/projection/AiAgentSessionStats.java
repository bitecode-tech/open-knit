package bitecode.modules.ai.model.data.projection;

import java.time.Instant;
import java.util.UUID;

public record AiAgentSessionStats(
        UUID agentId,
        String agentName,
        Long sessionId,
        UUID sessionUuid,
        long totalPrompts,
        Instant createdDate
) {
}
