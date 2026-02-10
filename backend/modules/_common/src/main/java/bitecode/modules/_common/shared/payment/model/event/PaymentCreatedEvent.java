package bitecode.modules._common.shared.payment.model.event;

import bitecode.modules._common.model.event.ModuleEvent;
import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record PaymentCreatedEvent(
        @NotNull UUID paymentId,
        @NotNull UUID userId,
        @Nullable UUID transactionId,
        @NotNull BigDecimal amount,
        @NotNull String currency,
        @NotNull PaymentStatus status,
        @NotNull PaymentType type,
        @NotNull PaymentGateway gateway
) implements ModuleEvent {
}
