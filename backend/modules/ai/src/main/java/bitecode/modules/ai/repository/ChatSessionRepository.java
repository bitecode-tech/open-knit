package bitecode.modules.ai.repository;

import bitecode.modules.ai.model.data.projection.ChatSessionWithUserMessageCount;
import bitecode.modules.ai.model.entity.ChatSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long>, CustomChatSessionRepository {
    boolean existsByExternalSessionId(String externalSessionId);

    Optional<ChatSession> findByExternalSessionId(String externalSessionId);

    @Query("""
            SELECT new bitecode.modules.ai.model.data.projection.ChatSessionWithUserMessageCount(cs, COUNT(m))
            FROM ChatSession cs
            LEFT JOIN cs.messages m 
              ON m.type = bitecode.modules.ai.model.enums.ChatMessageUserType.USER
            WHERE cs.agentId = :agentId
              AND cs.createdDate BETWEEN :startDate AND :endDate
            GROUP BY cs
            """)
    Page<ChatSessionWithUserMessageCount> findByAgentIdAndCreatedDateBetween(UUID agentId, Instant startDate, Instant endDate, Pageable pageable);

    @Transactional
    @Modifying
    @Query("""
                update ChatSession c 
                set c.lastResponseId = :lastResponseId 
                where c.externalSessionId = :externalSessionId 
                  and (
                    (:userId is null and c.userId is null)
                    or c.userId = :userId
                  )
            """)
    int updateLastResponseId(String externalSessionId, UUID userId, String lastResponseId);
}
