package bitecode.modules.payment;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import bitecode.modules._common.shared.payment.model.event.PaymentCreatedEvent;
import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.event.TransactionCreatedEvent;
import bitecode.modules.payment.payment.PaymentHistoryRepository;
import bitecode.modules.payment.payment.PaymentRepository;
import bitecode.modules.payment.payment.PaymentService;
import bitecode.modules.payment.payment.model.data.CreateNewPaymentData;
import bitecode.modules.payment.payment.provider.PaymentProvidersExecutor;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.testcontainers.shaded.org.awaitility.Awaitility.await;

public class PaymentTest extends PaymentIntegrationTest {

    @Autowired
    ApplicationEventPublisher eventPublisher;

    @Autowired
    PaymentService paymentService;
    @Autowired
    PaymentRepository paymentRepository;
    @Autowired
    PaymentHistoryRepository paymentHistoryRepository;

    @Autowired
    PaymentProvidersExecutor providersExecutor;

    @AfterEach
    public void cleanUp(){
        paymentHistoryRepository.deleteAll();
        paymentRepository.deleteAll();
    }

    @Test
    @DisplayName("Should create payment, send payment created event and receive transaction crated event with connected paymentId")
    public void shouldCreatePaymentAndReceiveTxnCreatedEvt() {
        var userId = UUID.randomUUID();
        // given
        var newPaymentData = CreateNewPaymentData.builder()
                .amount(BigDecimal.valueOf(123.319))
                .currency("pln")
                .gateway(PaymentGateway.MOCK)
                .type(PaymentType.RECURRING)
                .status(PaymentStatus.CONFIRMED)
                .userId(userId)
                .gatewayId("gatewayId")
                .build();

        // when
        paymentService.createPayment(newPaymentData);

        //then
        var allUserPayments = paymentRepository.findAllByUserId(userId);
        var userPayment = allUserPayments.getFirst();

        assertThat(allUserPayments.size(), is(1));
        assertThat(userPayment, allOf(
                hasProperty("amount", comparesEqualTo(BigDecimal.valueOf(123.319))),
                hasProperty("currency", is("pln")),
                hasProperty("type", is(PaymentType.RECURRING)),
                hasProperty("gatewayId", is("gatewayId")),
                hasProperty("gateway", is(PaymentGateway.MOCK)),
                hasProperty("status", is(PaymentStatus.CONFIRMED))
        ));

        var paymentCreatedEvents = await()
                .atMost(5, TimeUnit.SECONDS)
                .until(() -> allEventsCollector.getEventsOfType(PaymentCreatedEvent.class), events -> !events.isEmpty());

        assertThat(paymentCreatedEvents.size(), is(1));

        var paymentEvt = paymentCreatedEvents.getFirst();
        assertThat(paymentEvt.paymentId(), is(userPayment.getUuid()));
        assertThat(paymentEvt.transactionId(), is(nullValue()));
        assertThat(paymentEvt.amount(), comparesEqualTo(BigDecimal.valueOf(123.319)));
        assertThat(paymentEvt.currency(), is("pln"));
        assertThat(paymentEvt.status(), is(PaymentStatus.CONFIRMED));

        var paymentHistoryList = paymentHistoryRepository.findAll();
        assertThat(paymentHistoryList.size(), is(1));

        var transactionCreatedEvents = await()
                .atMost(5, TimeUnit.SECONDS)
                .until(() -> allEventsCollector.getEventsOfType(TransactionCreatedEvent.class), events -> !events.isEmpty());

        assertThat(transactionCreatedEvents.size(), is(1));

        var txnEvt = transactionCreatedEvents.getFirst();
        assertThat(txnEvt.uuid(), is(notNullValue()));
        assertThat(txnEvt.paymentId(), is(userPayment.getUuid()));
        assertThat(txnEvt.debitTotal(), comparesEqualTo(BigDecimal.valueOf(123.319)));
        assertThat(txnEvt.debitCurrency(), is("pln"));
        assertThat(txnEvt.status(), is(TransactionStatus.COMPLETED));
    }
}
