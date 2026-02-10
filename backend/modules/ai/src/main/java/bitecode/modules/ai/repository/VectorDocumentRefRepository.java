package bitecode.modules.ai.repository;

import bitecode.modules.ai.model.entity.VectorDocumentRef;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VectorDocumentRefRepository extends JpaRepository<VectorDocumentRef, Long> {
    Optional<VectorDocumentRef> findByUuidAndDeleted(UUID id, Boolean deleted);

    Page<VectorDocumentRef> findAllByAiAgentUuidAndDeleted(Pageable pageable, UUID uuid, Boolean deleted);

    List<VectorDocumentRef> findAllByAiAgentUuidAndDeletedFalse(UUID uuid);
}
