package bitecode.modules.wallet;

import bitecode.modules.wallet.model.entity.Wallet;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserId(String userId);

    @EntityGraph(attributePaths = "assets")
    Optional<Wallet> findOneByUserId(String userId);
}
