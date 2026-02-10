package bitecode.modules.payment.payment.model.data.details;

import bitecode.modules.payment.payment.model.enums.PaymentUpdateType;
import lombok.Builder;

import java.time.Instant;

@Builder
public record PaymentHistoryDetails(
        PaymentUpdateType updateType,
        String updateData,
        Instant createdDate
) {
}
