package bitecode.modules.auth.auth.repository;

import bitecode.modules.auth.auth.model.entity.TOTPSecret;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TOTPSecretRepository extends JpaRepository<TOTPSecret, Long> {
    Optional<TOTPSecret> findByUserId(Long userId);
}
