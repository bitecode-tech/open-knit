package bitecode.modules.transaction.model.data;

import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import lombok.Builder;

import java.time.Instant;

@Builder
public record TransactionCriteria(
        TransactionStatus status,
        TransactionStatus statusNot,
        Instant startDate,
        Instant endDate
) {

}
