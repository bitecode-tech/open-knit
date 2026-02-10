package bitecode.modules.payment.payment;

import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules.payment.payment.model.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByUuid(UUID id);

    Optional<Payment> findByGatewayId(String gatewayId);

    List<Payment> findAllByStatus(PaymentStatus status);

    List<Payment> findAllByUserId(UUID userId);

    @Query("""
            SELECT p
            FROM Payment p
            LEFT JOIN FETCH p.paymentHistoryList ph
            WHERE ph.applied = true
            """)
    Page<Payment> findAllFetchHistoryAppliedTrue(Pageable pageable);

    @Query("""
            SELECT p
            FROM Payment p
            LEFT JOIN FETCH p.paymentHistoryList ph
            WHERE p.uuid = :id AND ph.applied = true
            """)
    Optional<Payment> findFetchHistoryAppliedTrue(UUID id);

    @Transactional
    @Modifying
    @Query("UPDATE Payment p SET p.transactionId = :transactionId WHERE p.uuid = :id")
    void updatePaymentByUuidSetTransactionId(UUID id, UUID transactionId);
}
