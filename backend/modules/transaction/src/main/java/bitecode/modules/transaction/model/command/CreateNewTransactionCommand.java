package bitecode.modules.transaction.model.command;

import bitecode.modules._common.eventsourcing.config.EventVersion;
import bitecode.modules._common.shared.transaction.model.enums.*;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
@EventVersion("v1")
public record CreateNewTransactionCommand(
        UUID userId,
        UUID paymentId,
        TransactionType type,
        TransactionStatus status,
        TransactionSubstatus subStatus,
        BigDecimal debitTotal,
        TransactionDebitType debitType,
        String debitSubtype,
        String debitCurrency,
        String debitReferenceId, // entity that created this transaction
        BigDecimal creditTotal,
        TransactionCreditType creditType,
        String creditSubtype,
        String creditCurrency,
        String creditReferenceId
) implements AbstractTransactionCommand {
}
