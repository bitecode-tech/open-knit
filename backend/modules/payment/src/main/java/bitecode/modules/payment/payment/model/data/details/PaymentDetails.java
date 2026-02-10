package bitecode.modules.payment.payment.model.data.details;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record PaymentDetails(
        UUID uuid,
        UUID userId,
        UUID transactionId,
        BigDecimal amount,
        String currency,
        String gatewayId,
        PaymentGateway gateway,
        PaymentStatus status,
        PaymentType type,
        Instant createdDate,
        List<PaymentHistoryDetails> history
) {
}
