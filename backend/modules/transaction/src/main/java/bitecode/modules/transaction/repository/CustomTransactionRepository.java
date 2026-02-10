package bitecode.modules.transaction.repository;

import bitecode.modules.transaction.model.data.TransactionCriteria;
import bitecode.modules.transaction.model.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface CustomTransactionRepository {
    Page<Transaction> findByCriteria(Pageable pageable, TransactionCriteria criteria);
}
