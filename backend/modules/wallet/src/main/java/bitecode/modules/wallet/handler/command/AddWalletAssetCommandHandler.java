package bitecode.modules.wallet.handler.command;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules.wallet.WalletAssetEventHandler;
import bitecode.modules.wallet.WalletAssetRepository;
import bitecode.modules.wallet.model.command.AddWalletAssetCommand;
import bitecode.modules.wallet.model.entity.WalletAsset;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class AddWalletAssetCommandHandler extends AbstractWalletAssetCommandHandler<AddWalletAssetCommand> {
    private final WalletAssetRepository walletAssetRepository;

    @Override
    @Transactional
    public WalletAsset handle(AddWalletAssetCommand command, Map<String, Object> params) throws UnappliedCommandException {
        var walletAsset = walletAssetRepository.findByUserIdAndName(command.getUserId(), command.getCurrency())
                .orElseThrow(() -> genericUnappliedHandlerException(command));
        params.put(WalletAssetEventHandler.Params.BEFORE_WALLET_ASSET_TOTAL, walletAsset.getTotalAmount());
        walletAsset.setTotalAmount(walletAsset.getTotalAmount().add(command.getAmount()));
        return walletAsset;
    }

    @Override
    public Class<AddWalletAssetCommand> getCommandClass() {
        return AddWalletAssetCommand.class;
    }
}
