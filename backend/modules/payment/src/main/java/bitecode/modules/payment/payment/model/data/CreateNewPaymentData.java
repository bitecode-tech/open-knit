package bitecode.modules.payment.payment.model.data;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record CreateNewPaymentData(
        @NotNull
        UUID userId,
        @Nullable
        UUID transactionId, // if not txnId is provided, Transaction Module will try to create one
        @NotNull
        String currency,
        @NotNull
        BigDecimal amount,
        @NotNull
        PaymentGateway gateway,
        @NotNull
        String gatewayId,
        @NotNull
        PaymentType type,
        @NotNull
        PaymentStatus status
) {
}
