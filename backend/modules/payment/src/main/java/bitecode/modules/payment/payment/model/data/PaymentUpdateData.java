package bitecode.modules.payment.payment.model.data;

import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import lombok.Builder;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record PaymentUpdateData(
        @Nullable
        UUID paymentId,  //OUR paymentId
        String externalId, //THEIRS/PROVIDER gatewayPaymentId
        PaymentStatus status,
        @Nullable
        BigDecimal amount,
        Instant modifiedAt
) {
}
