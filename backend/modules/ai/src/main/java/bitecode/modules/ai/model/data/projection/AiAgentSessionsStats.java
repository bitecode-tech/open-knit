package bitecode.modules.ai.model.data.projection;

import java.time.Instant;
import java.util.UUID;

public record AiAgentSessionsStats(
        UUID agentId,
        String agentName,
        long totalSessions,
        long sessionsInRange,
        Instant mostRecentSessionDate
) {
}
