package bitecode.modules.ai.repository;

import bitecode.modules.ai.model.entity.AiAgent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiAgentRepository extends JpaRepository<AiAgent, Long> {
    // don't do double left join, it will result in cartesian product
    @Query("""
            select distinct agent
            from AiAgent agent
            left join fetch agent.documents docs
            where agent.uuid = :uuid and agent.deleted = false
            """)
    Optional<AiAgent> findByUuidFetchNonDeletedDocsAndDeletedFalse(UUID uuid);

    Page<AiAgent> findAllByDeletedFalse(Pageable pageable);
}
