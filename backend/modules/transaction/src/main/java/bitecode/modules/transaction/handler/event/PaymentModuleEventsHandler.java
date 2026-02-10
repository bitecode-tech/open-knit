package bitecode.modules.transaction.handler.event;

import bitecode.modules._common.model.event.ModuleEvent;
import bitecode.modules._common.shared.payment.model.event.PaymentCreatedEvent;
import bitecode.modules._common.shared.payment.model.event.PaymentStatusUpdatedEvent;
import bitecode.modules.transaction.model.command.AbstractTransactionCommand;
import bitecode.modules.transaction.model.command.payment.ConfirmPaymentTransactionCommand;
import bitecode.modules.transaction.model.command.payment.CreatePaymentTransactionCommand;
import bitecode.modules.transaction.model.command.payment.SetPaymentTransactionErrorCommand;
import bitecode.modules.transaction.repository.TransactionCommandHandler;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PaymentModuleEventsHandler {
    private final TransactionCommandHandler transactionCommandHandler;

    @Async
    @EventListener(classes = {PaymentCreatedEvent.class, PaymentStatusUpdatedEvent.class})
    public void handle(ModuleEvent event) {
        var txnEvent = switch (event) {
            case PaymentCreatedEvent _event -> createNewTransactionCommand(_event);
            case PaymentStatusUpdatedEvent _event -> createStatusUpdateCommand(_event);
            case null, default -> null;
        };

        if (txnEvent != null) {
            transactionCommandHandler.handle(txnEvent);
        }
    }

    CreatePaymentTransactionCommand createNewTransactionCommand(@Valid PaymentCreatedEvent event) {
        if (event.transactionId() == null) {
            return CreatePaymentTransactionCommand.builder()
                    .userId(event.userId())
                    .paymentId(event.paymentId())
                    .amount(event.amount())
                    .currency(event.currency())
                    .paymentType(event.type())
                    .paymentStatus(event.status())
                    .paymentGateway(event.gateway())
                    .build();
        }
        return null;
    }

    AbstractTransactionCommand createStatusUpdateCommand(PaymentStatusUpdatedEvent event) {
        return switch (event.newStatus()) {
            case CONFIRMED -> ConfirmPaymentTransactionCommand.builder()
                    .uuid(event.transactionId())
                    .build();
            case ERROR -> SetPaymentTransactionErrorCommand.builder()
                    .uuid(event.transactionId())
                    .build();
            case NEW, PENDING, ABANDONED, EXPIRED, REJECTED -> null;
        };
    }

}
