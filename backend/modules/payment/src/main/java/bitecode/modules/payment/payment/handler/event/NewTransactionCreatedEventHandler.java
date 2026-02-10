package bitecode.modules.payment.payment.handler.event;

import bitecode.modules._common.shared.transaction.model.event.TransactionCreatedEvent;
import bitecode.modules.payment.payment.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class NewTransactionCreatedEventHandler {

    private final PaymentService paymentService;

    @Async
    @EventListener(TransactionCreatedEvent.class)
    public void handleNewTransactionCreatedCommand(TransactionCreatedEvent event) {
        if (event.paymentId() != null) {
            paymentService.updatePaymentTransactionId(event.paymentId(), event.uuid());
        }
    }
}
