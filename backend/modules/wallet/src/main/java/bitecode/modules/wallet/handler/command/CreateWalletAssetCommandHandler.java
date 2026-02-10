package bitecode.modules.wallet.handler.command;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules.wallet.WalletAssetEventHandler;
import bitecode.modules.wallet.WalletAssetRepository;
import bitecode.modules.wallet.WalletService;
import bitecode.modules.wallet.model.command.CreateWalletAssetCommand;
import bitecode.modules.wallet.model.entity.WalletAsset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class CreateWalletAssetCommandHandler extends AbstractWalletAssetCommandHandler<CreateWalletAssetCommand> {
    private final WalletService walletService;
    private final WalletAssetRepository walletAssetRepository;

    @Override
    @Transactional
    public WalletAsset handle(CreateWalletAssetCommand command, Map<String, Object> params) throws UnappliedCommandException {
        var wallet = walletService.findOrCreateWallet(command.getUserId());
        var walletAsset = WalletAsset.builder()
                .userId(wallet.getUserId())
                .wallet(wallet)
                .name(command.getCurrency())
                .totalAmount(BigDecimal.ZERO)
                .holdAmount(BigDecimal.ZERO)
                .build();
        wallet.getAssets().add(walletAsset);
        params.put(WalletAssetEventHandler.Params.BEFORE_WALLET_ASSET_TOTAL, walletAsset.getTotalAmount());
        return walletAssetRepository.save(walletAsset);
    }

    @Override
    public Class<CreateWalletAssetCommand> getCommandClass() {
        return CreateWalletAssetCommand.class;
    }
}
