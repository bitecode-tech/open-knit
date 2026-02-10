package bitecode.modules.transaction.repository;

import bitecode.modules.transaction.model.entity.TransactionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionEventRepository extends JpaRepository<TransactionEvent, Long> {
    List<TransactionEvent> findAllByTransactionId(Long transactionId);
}
