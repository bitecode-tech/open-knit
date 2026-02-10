package bitecode.modules.wallet.model.command;

import bitecode.modules._common.eventsourcing.config.EventVersion;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@EventVersion("v1")
public class AddWalletAssetCommand extends AbstractWalletAssetCommand {
}
