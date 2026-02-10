package bitecode.modules.auth.auth.repository;

import bitecode.modules.auth.auth.model.entity.OauthIdentity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OauthIdentityRepository extends JpaRepository<OauthIdentity, Long> {
    Optional<OauthIdentity> findByProviderAndProviderUserId(String provider, String providerUserId);
} 