package bitecode.modules.ai.repository;

import bitecode.modules.ai.model.entity.AiServicesProviderConfig;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiServicesProviderConfigRepository extends JpaRepository<AiServicesProviderConfig, Long> {
    Optional<AiServicesProviderConfig> findByProvider(AiServicesProviderType provider);
}
