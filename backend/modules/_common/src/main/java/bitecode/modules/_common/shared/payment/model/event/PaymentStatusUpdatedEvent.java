package bitecode.modules._common.shared.payment.model.event;

import bitecode.modules._common.model.event.ModuleEvent;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import lombok.Builder;

import java.util.UUID;

@Builder
public record PaymentStatusUpdatedEvent(
        UUID paymentId,
        UUID transactionId,
        PaymentStatus newStatus,
        PaymentStatus oldStatus
) implements ModuleEvent {
}
