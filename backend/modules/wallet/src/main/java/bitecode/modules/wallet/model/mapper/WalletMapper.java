package bitecode.modules.wallet.model.mapper;

import bitecode.modules.wallet.model.data.WalletAssetDetails;
import bitecode.modules.wallet.model.data.WalletDetails;
import bitecode.modules.wallet.model.entity.Wallet;
import bitecode.modules.wallet.model.entity.WalletAsset;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface WalletMapper {
    WalletDetails toWalletDetails(Wallet wallet);

    WalletAssetDetails toWalletAssetDetails(WalletAsset walletAsset);
}
