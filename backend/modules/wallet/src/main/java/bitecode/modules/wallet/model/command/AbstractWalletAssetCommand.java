package bitecode.modules.wallet.model.command;

import bitecode.modules._common.eventsourcing.model.Command;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@SuperBuilder
public abstract class AbstractWalletAssetCommand implements Command {
    @NotBlank
    private String userId;
    @NotNull
    private BigDecimal amount;
    @NotBlank
    private String currency;
    @NotBlank
    private String referenceId;
}
