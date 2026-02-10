package bitecode.modules.transaction.repository;


import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules.transaction.model.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, CustomTransactionRepository {
    Optional<Transaction> findByUuid(UUID transactionId);

    @EntityGraph(attributePaths = {"events"})
    @Query("SELECT t FROM Transaction t where t.uuid = :transactionId")
    Optional<Transaction> findByUuidFetchEvents(UUID transactionId);

    List<Transaction> findAllByUserId(UUID userId);

    Page<Transaction> findAllByStatus(Pageable pageable, TransactionStatus status);

    Page<Transaction> findAllByStatusNot(Pageable pageable, TransactionStatus status);

    Long countAllByStatus(TransactionStatus status);

    Long countAllByStatusNot(TransactionStatus status);
}
