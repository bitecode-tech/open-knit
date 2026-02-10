package bitecode.modules.ai.repository;

import bitecode.modules.ai.model.entity.ChatSessionMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ChatSessionMessageRepository extends JpaRepository<ChatSessionMessage, Long> {

    @Query("""
            SELECT msg FROM ChatSessionMessage msg
            LEFT JOIN ChatSession cs ON cs.externalSessionId = msg.externalSessionId
            WHERE cs.uuid = :uuid
            """)
    Page<ChatSessionMessage> findAllBySessionUuid(UUID uuid, Pageable pageable);

    Page<ChatSessionMessage> findAllByExternalSessionId(String externalSessionId, Pageable pageable);
}
