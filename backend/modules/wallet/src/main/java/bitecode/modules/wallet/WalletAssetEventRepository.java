package bitecode.modules.wallet;


import bitecode.modules.wallet.model.entity.WalletAssetEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletAssetEventRepository extends JpaRepository<WalletAssetEvent, Long> {
    List<WalletAssetEvent> findAllByWalletAssetId(Long walletAssetId);
}
