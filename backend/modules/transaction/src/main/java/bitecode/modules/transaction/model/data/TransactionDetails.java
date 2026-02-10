package bitecode.modules.transaction.model.data;

import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionSubstatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record TransactionDetails(
        String uuid,
        String userId,
        String paymentId,
        TransactionType type,
        TransactionStatus status,
        TransactionSubstatus subStatus,
        BigDecimal debitTotal,
        String debitType,
        String debitSubtype,
        String debitCurrency,
        BigDecimal creditTotal,
        String creditType,
        String creditSubtype,
        String creditCurrency,
        Instant createdDate,
        Instant updatedDate,
        List<TransactionEventDetails> events
) {

}
