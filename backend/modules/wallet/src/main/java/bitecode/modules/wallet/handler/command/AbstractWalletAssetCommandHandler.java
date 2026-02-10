package bitecode.modules.wallet.handler.command;


import bitecode.modules._common.eventsourcing.model.AbstractCommandHandler;
import bitecode.modules._common.eventsourcing.model.Command;
import bitecode.modules.wallet.model.entity.WalletAsset;

public abstract class AbstractWalletAssetCommandHandler<C extends Command> extends AbstractCommandHandler<WalletAsset, C> {

}
