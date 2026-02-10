package bitecode.modules.payment.subscription.handler.event;

import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.event.TransactionStatusUpdatedEvent;
import bitecode.modules.payment.subscription.SubscriptionService;
import bitecode.modules.payment.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TransactionModuleEventHandler {
    private final SubscriptionRepository repository;
    private final SubscriptionService subscriptionService;

    @Async
    @Transactional
    @EventListener(TransactionStatusUpdatedEvent.class)
    public void handleTransactionEvent(TransactionStatusUpdatedEvent event) {
        if (TransactionStatus.COMPLETED.equals(event.status())) {
            var subscriptionId = UUID.fromString(event.debitReferenceId());
            var subscription = repository.findByUuid(subscriptionId)
                    .orElseThrow(() -> new RuntimeException("Could not find subscription with id: " + subscriptionId));
            subscriptionService.addSubscriptionPayment(subscription);
        }
    }
}
