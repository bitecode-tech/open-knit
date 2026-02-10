package bitecode.modules.wallet.handler.command;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules.wallet.WalletAssetEventHandler;
import bitecode.modules.wallet.WalletAssetRepository;
import bitecode.modules.wallet.model.command.SubtractWalletAssetCommand;
import bitecode.modules.wallet.model.entity.WalletAsset;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class SubtractWalletAssetCommandHandler extends AbstractWalletAssetCommandHandler<SubtractWalletAssetCommand> {
    private final WalletAssetRepository walletAssetRepository;

    @Override
    @Transactional
    public WalletAsset handle(SubtractWalletAssetCommand command, Map<String, Object> params) throws UnappliedCommandException {
        var walletAsset = walletAssetRepository.findByUserIdAndName(command.getUserId(), command.getCurrency())
                .orElseThrow(() -> genericUnappliedHandlerException(command));
        if (walletAsset.getTotalAmount().compareTo(command.getAmount()) < 0) {
            throw new UnappliedCommandException("Not enough money");
        }
        params.put(WalletAssetEventHandler.Params.BEFORE_WALLET_ASSET_TOTAL, walletAsset.getTotalAmount());
        walletAsset.setTotalAmount(walletAsset.getTotalAmount().subtract(command.getAmount()));
        return walletAsset;
    }

    @Override
    public Class<SubtractWalletAssetCommand> getCommandClass() {
        return SubtractWalletAssetCommand.class;
    }
}
