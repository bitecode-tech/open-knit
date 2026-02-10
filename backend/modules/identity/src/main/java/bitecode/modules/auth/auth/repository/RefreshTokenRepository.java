package bitecode.modules.auth.auth.repository;

import bitecode.modules.auth.auth.model.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByUuid(UUID token);

    Optional<RefreshToken> findByUsernameAndRevokedFalseAndExpirationTimeGreaterThan(String username, Instant instant);
}
