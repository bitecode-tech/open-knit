package bitecode.modules._common.shared.transaction.model.event;

import bitecode.modules._common.model.event.ModuleEvent;
import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionSubstatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionType;
import lombok.Builder;

@Builder
public record TransactionStatusUpdatedEvent(
        String uuid,
        String userId,
        String paymentId,
        TransactionType type,
        TransactionStatus status,
        TransactionSubstatus subStatus,
        String creditReferenceId,
        String debitReferenceId
) implements ModuleEvent {
}
