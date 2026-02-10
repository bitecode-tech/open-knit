package bitecode.modules.ai.repository;

import bitecode.modules.ai.model.data.projection.AgentChatSession;
import bitecode.modules.ai.model.data.projection.AiAgentSessionStats;
import bitecode.modules.ai.model.data.projection.AiAgentSessionsStats;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.Nullable;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface CustomChatSessionRepository {
    Page<AiAgentSessionsStats> findAgentSessionsStats(@Nullable String name, Instant startDate, Instant endDate, Pageable pageable);

    Optional<AiAgentSessionStats> findAgentSessionStatsBySessionId(Long id, @Nullable Instant startDate, @Nullable Instant endDate);

    Page<AgentChatSession> findAgentChatSessions(UUID agentId, @Nullable Instant startDate, @Nullable Instant endDate, Pageable pageable);
}