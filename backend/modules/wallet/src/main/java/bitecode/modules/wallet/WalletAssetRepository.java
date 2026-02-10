package bitecode.modules.wallet;


import bitecode.modules.wallet.model.entity.WalletAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface WalletAssetRepository extends JpaRepository<WalletAsset, Long> {
    Optional<WalletAsset> findByUserIdAndName(String userId, String name);
}

