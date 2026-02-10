package bitecode.modules.wallet;

import bitecode.modules.wallet.model.entity.Wallet;
import bitecode.modules.wallet.model.entity.WalletAsset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;
    private final WalletAssetRepository walletAssetRepository;

    public Wallet findOrCreateWalletFetchAssets(String userId) {
        return walletRepository.findOneByUserId(userId)
                .orElseGet(() -> createNewWallet(userId));
    }

    public Wallet findOrCreateWallet(String userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> createNewWallet(userId));
    }

    public boolean checkWalletAssetAmount(String userId, String assetName, BigDecimal amount) {
        return walletAssetRepository.findByUserIdAndName(userId, assetName)
                .filter(walletAsset -> walletAsset.getTotalAmount().compareTo(amount) >= 0)
                .isPresent();
    }

    public Optional<WalletAsset> findWalletAsset(String userId, String name) {
        return walletAssetRepository.findByUserIdAndName(userId, name);
    }

    private Wallet createNewWallet(String userId) {
        return walletRepository.save(Wallet.builder()
                .frozen(false)
                .userId(userId)
                .build());
    }
}
