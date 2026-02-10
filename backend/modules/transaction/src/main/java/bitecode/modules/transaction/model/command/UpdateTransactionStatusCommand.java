package bitecode.modules.transaction.model.command;

import bitecode.modules._common.eventsourcing.config.EventVersion;
import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionSubstatus;
import jakarta.annotation.Nullable;
import lombok.Builder;

import java.util.UUID;

@Builder
@EventVersion("v1")
public record UpdateTransactionStatusCommand(
        UUID uuid,
        @Nullable TransactionStatus status,
        TransactionSubstatus subStatus
) implements AbstractTransactionCommand {
}
