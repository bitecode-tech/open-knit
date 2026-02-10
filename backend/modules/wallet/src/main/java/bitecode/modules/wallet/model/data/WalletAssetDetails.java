package bitecode.modules.wallet.model.data;

import java.math.BigDecimal;

public record WalletAssetDetails(
        String name,
        BigDecimal totalAmount,
        BigDecimal holdAmount
) {

}
