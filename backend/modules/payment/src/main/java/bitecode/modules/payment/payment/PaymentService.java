package bitecode.modules.payment.payment;

import bitecode.modules._common.service.cache.CacheService;
import bitecode.modules._common.service.locking.InMemoryLock;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.event.PaymentStatusUpdatedEvent;
import bitecode.modules.payment.payment.model.data.CreateNewPaymentData;
import bitecode.modules.payment.payment.model.data.PaymentUpdateData;
import bitecode.modules.payment.payment.model.entity.Payment;
import bitecode.modules.payment.payment.model.entity.PaymentHistory;
import bitecode.modules.payment.payment.model.enums.PaymentUpdateType;
import bitecode.modules.payment.payment.model.mapper.PaymentMapper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentHistoryRepository historyRepository;
    private final PaymentRepository paymentRepository;
    private final ObjectMapper objectMapper;
    private final PaymentMapper paymentMapper;
    private final TransactionTemplate transactionTemplate;
    private InMemoryLock paymentLock;

    public Page<Payment> findAll(Pageable pageable, boolean includeEvents) {
        return includeEvents
                ? paymentRepository.findAllFetchHistoryAppliedTrue(pageable)
                : paymentRepository.findAll(pageable);
    }

    public Optional<Payment> findByUuid(UUID paymentId, boolean includeEvents) {
        return includeEvents
                ? paymentRepository.findFetchHistoryAppliedTrue(paymentId)
                : paymentRepository.findByUuid(paymentId);
    }

    @Transactional
    public Payment createPayment(@Valid CreateNewPaymentData data) {
        var payment = transactionTemplate.execute(status -> {
            var _payment = Payment.builder()
                    .userId(data.userId())
                    .transactionId(data.transactionId())
                    .amount(data.amount())
                    .currency(data.currency())
                    .status(data.status())
                    .type(data.type())
                    .gatewayId(data.gatewayId())
                    .gateway(data.gateway())
                    .build();
            try {
                return persistPaymentSink(_payment, data, true, PaymentUpdateType.NEW);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
        eventPublisher.publishEvent(paymentMapper.toPaymentCreatedCommand(payment));
        return payment;
    }

    @Transactional
    public Payment updatePaymentStatus(PaymentUpdateData updateNotification) {
        var payment = findPayment(updateNotification);
        var isLocked = paymentLock.tryLock(payment.getUuid().toString());
        try {
            var oldStatus = payment.getStatus();
            if (PaymentStatus.CONFIRMED == oldStatus && payment.getAmount().compareTo(updateNotification.amount()) != 0) {
                log.error("payment and updateNotification amounts not equal,payment={},updateNotification={}", payment, updateNotification);
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "update notification amounts not equal");
            }
            var statusChanged = updatePaymentStatus(updateNotification.status(), oldStatus, payment);
            payment = persistPaymentSink(payment, updateNotification, statusChanged, PaymentUpdateType.UPDATE);

            if (statusChanged) {
                sendPaymentStatusUpdateEvent(payment, oldStatus);
            }
            return payment;
        } catch (Exception e) {
            log.error("PaymentService::updatePaymentStatus,exception={}", e, e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Processing error");
        } finally {
            if (isLocked) {
                paymentLock.unlock(payment.getUuid().toString());
            }
        }
    }

    public void updatePaymentTransactionId(UUID paymentId, UUID transactionId) {
        paymentRepository.updatePaymentByUuidSetTransactionId(paymentId, transactionId);
    }

    private void sendPaymentStatusUpdateEvent(Payment payment, PaymentStatus oldStatus) {
        eventPublisher.publishEvent(PaymentStatusUpdatedEvent.builder()
                .paymentId(payment.getUuid())
                .transactionId(payment.getTransactionId())
                .newStatus(payment.getStatus())
                .oldStatus(oldStatus)
                .build());
    }

    private static boolean updatePaymentStatus(PaymentStatus requestNewStatus, PaymentStatus oldStatus, Payment payment) {
        var canUpdateOldStatus = requestNewStatus.canUpdateOldStatus(oldStatus);
        if (canUpdateOldStatus) {
            payment.setStatus(requestNewStatus);
        }
        return canUpdateOldStatus;
    }

    private PaymentHistory newHistoryEntry(Payment payment, Object updateChangelogData, boolean applied, PaymentUpdateType paymentUpdateType) throws IOException {
        return PaymentHistory.builder()
                .payment(payment)
                .applied(applied)
                .updateData(objectMapper.writeValueAsString(updateChangelogData))
                .updateType(paymentUpdateType)
                .build();
    }

    private Payment persistPaymentSink(Payment payment, Object createOrUpdateData, boolean applied, PaymentUpdateType paymentUpdateType) throws IOException {
        var paymentHistory = newHistoryEntry(payment, createOrUpdateData, applied, paymentUpdateType);
        paymentRepository.save(payment);
        historyRepository.save(paymentHistory);
        return payment;
    }

    private Payment findPayment(PaymentUpdateData updateNotification) {
        return (updateNotification.paymentId() != null
                ? paymentRepository.findByUuid(updateNotification.paymentId())
                : paymentRepository.findByGatewayId(updateNotification.externalId())
        ).orElseThrow(() -> new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR,
                "PaymentService::updatePaymentStatus,Requested payment update not found,req=" + updateNotification));
    }

    @Autowired
    public void setPaymentLock(CacheService cacheService) {
        this.paymentLock = new InMemoryLock(cacheService, "PAYMENT_LOCK");
    }
}
