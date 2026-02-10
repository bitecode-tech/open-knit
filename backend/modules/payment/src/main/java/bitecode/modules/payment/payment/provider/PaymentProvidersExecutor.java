package bitecode.modules.payment.payment.provider;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules.payment.payment.PaymentRepository;
import bitecode.modules.payment.payment.PaymentService;
import bitecode.modules.payment.payment.model.data.PaymentUpdateData;
import bitecode.modules.payment.payment.model.entity.Payment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
public class PaymentProvidersExecutor {
    private final Map<PaymentGateway, PaymentProvider> paymentProviders;
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final TransactionTemplate transactionTemplate;

    public PaymentProvidersExecutor(List<PaymentProvider> paymentProviders, PaymentService paymentService,
                                    PaymentRepository paymentRepository, TransactionTemplate transactionTemplate) {
        this.paymentProviders = paymentProviders.stream()
                .collect(Collectors.toMap(PaymentProvider::paymentGateway, Function.identity()));
        this.paymentService = paymentService;
        this.paymentRepository = paymentRepository;
        this.transactionTemplate = transactionTemplate;
    }

//    @Scheduled(cron = "${bitecode.app.jobs.payment-provider-executor}")
//    public void initPayments() {
//        var newPayments = paymentRepository.findAllByStatus(PaymentStatus.NEW);
//        for (var payment : newPayments) {
//            var paymentProvider = paymentProviders.get(payment.getGateway());
//            initPayment(payment, paymentProvider);
//        }
//    }

    public void initPayment(Payment payment, PaymentProvider paymentProvider) {
        transactionTemplate.execute(status -> {
            try {
                var paymentData = paymentProvider.executePayment(payment.getUuid(), payment.getAmount(), payment.getCurrency());
                paymentService.updatePaymentStatus(PaymentUpdateData.builder()
                        .paymentId(payment.getUuid())
                        .externalId(paymentData.externalReferenceId())
                        .status(paymentData.paymentStatus())
                        .amount(payment.getAmount())
                        .modifiedAt(Instant.now())
                        .build());
            } catch (Exception e) {
                log.error("Exception while trying to init payment={}", payment, e);
                payment.setStatus(PaymentStatus.ERROR);
                paymentRepository.save(payment);
            }
            return null;
        });
    }
}
