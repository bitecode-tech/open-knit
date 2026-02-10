package bitecode.modules.transaction.model.command.payment;

import bitecode.modules._common.eventsourcing.config.EventVersion;
import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import bitecode.modules.transaction.model.command.AbstractTransactionCommand;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
@EventVersion("v1")
public record CreatePaymentTransactionCommand(
        UUID paymentId,
        UUID userId,
        PaymentStatus paymentStatus,
        BigDecimal amount,
        String currency,
        PaymentType paymentType,
        PaymentGateway paymentGateway

) implements AbstractTransactionCommand {
}
