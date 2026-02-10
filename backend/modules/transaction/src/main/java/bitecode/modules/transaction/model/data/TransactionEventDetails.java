package bitecode.modules.transaction.model.data;

import bitecode.modules._common.eventsourcing.model.Command;

import java.time.Instant;

public record TransactionEventDetails(
        String eventName,
        Command eventData,
        Instant createdDate
) {
}
