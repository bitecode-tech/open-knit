package bitecode.modules._common.shared.transaction.model.event;

import bitecode.modules._common.model.event.ModuleEvent;
import bitecode.modules._common.shared.transaction.model.enums.*;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record TransactionCreatedEvent(
        UUID uuid,
        UUID userId,
        UUID paymentId,
        TransactionType type,
        TransactionStatus status,
        TransactionSubstatus subStatus,
        BigDecimal debitTotal,
        TransactionDebitType debitType,
        String debitSubtype,
        String debitCurrency,
        String debitReferenceId,
        BigDecimal creditTotal,
        TransactionCreditType creditType,
        String creditSubtype,
        String creditCurrency,
        String creditReferenceId
) implements ModuleEvent {
}
