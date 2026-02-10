package bitecode.modules.transaction;

import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules.transaction.model.data.TransactionCriteria;
import bitecode.modules.transaction.model.entity.Transaction;
import bitecode.modules.transaction.model.entity.TransactionEvent;
import bitecode.modules.transaction.repository.TransactionEventRepository;
import bitecode.modules.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository txnRepository;
    private final TransactionEventRepository txnEventRepository;

    public Page<Transaction> findAllTransactions(Pageable pageable) {
        return txnRepository.findAll(pageable);
    }

    public Page<Transaction> findAllTransactionsByCriteria(Pageable pageable, TransactionCriteria criteria) {
        return txnRepository.findByCriteria(pageable, criteria);
    }

    public Map<String, Long> getFiltersTotalElemsCount() {
        return Map.of("ALL", txnRepository.count(),
                "COMPLETED", txnRepository.countAllByStatus(TransactionStatus.COMPLETED),
                "INCOMPLETE", txnRepository.countAllByStatusNot(TransactionStatus.COMPLETED)
        );
    }

    public Optional<Transaction> getTransaction(UUID id, boolean includeEvents) {
        return includeEvents
                ? txnRepository.findByUuidFetchEvents(id)
                : txnRepository.findByUuid(id);
    }

    public List<TransactionEvent> getEvents(long transactionId) {
        return txnEventRepository.findAllByTransactionId(transactionId);
    }
}
