package bitecode.modules.transaction.model.command.payment;

import bitecode.modules._common.eventsourcing.config.EventVersion;
import bitecode.modules.transaction.model.command.AbstractTransactionCommand;
import lombok.Builder;

import java.util.UUID;

@Builder
@EventVersion("v1")
public record SetPaymentTransactionErrorCommand(
        UUID uuid
) implements AbstractTransactionCommand {
}
