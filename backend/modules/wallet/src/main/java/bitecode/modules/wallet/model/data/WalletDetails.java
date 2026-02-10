package bitecode.modules.wallet.model.data;

import java.util.List;

public record WalletDetails(
        String uuid,
        String userId,
        List<WalletAssetDetails> assets,
        boolean frozen
) {
}
