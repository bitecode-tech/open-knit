package bitecode.modules.transaction;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import bitecode.modules._common.shared.payment.model.event.PaymentCreatedEvent;
import bitecode.modules._common.shared.transaction.model.enums.TransactionDebitType;
import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionSubstatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionType;
import bitecode.modules.transaction._config.TransactionIntegrationTest;
import bitecode.modules.transaction.repository.TransactionCommandHandler;
import bitecode.modules.transaction.repository.TransactionEventRepository;
import bitecode.modules.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.testcontainers.shaded.org.awaitility.Awaitility.await;

public class TransactionPaymentTest extends TransactionIntegrationTest {

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    TransactionEventRepository transactionEventRepository;

    @Autowired
    ApplicationEventPublisher eventPublisher;

    @Autowired
    TransactionCommandHandler transactionCommandHandler;

    @Test
    @Transactional
    public void shouldCreateNewTransactionAfterReceivingPaymentConfirmedEvent() {
        // given
        var userId = UUID.randomUUID();
        var paymentId = UUID.randomUUID();
        var paymentCreatedEvt = PaymentCreatedEvent.builder()
                .userId(userId)
                .paymentId(paymentId)
                .amount(BigDecimal.valueOf(123.319))
                .type(PaymentType.RECURRING)
                .status(PaymentStatus.CONFIRMED)
                .currency("pln")
                .gateway(PaymentGateway.MOCK)
                .build();

        // when
        eventPublisher.publishEvent(paymentCreatedEvt);

        // then

        var transactions = await()
                .atMost(5, TimeUnit.SECONDS)
                .until(() -> transactionRepository.findAllByUserId(userId), list -> !list.isEmpty());
        assertThat(transactions.size(), is(1));

        var txn = transactions.getFirst();

        assertThat(txn, allOf(
                hasProperty("userId", is(userId)),
                hasProperty("type", is(TransactionType.SUBSCRIPTION_PAYMENT)),
                hasProperty("status", is(TransactionStatus.COMPLETED)),
                hasProperty("subStatus", is(TransactionSubstatus.DONE)),
                hasProperty("debitTotal", is(BigDecimal.valueOf(123.32))),
                hasProperty("debitType", is(TransactionDebitType.CARD)),
                hasProperty("creditTotal", is(BigDecimal.valueOf(123.32))),
                hasProperty("creditType", is(notNullValue())),
                hasProperty("creditCurrency", is("pln"))
        ));
    }
}
