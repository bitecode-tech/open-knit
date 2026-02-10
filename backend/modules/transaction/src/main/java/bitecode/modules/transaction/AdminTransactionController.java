package bitecode.modules.transaction;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules.transaction.model.data.TransactionCriteria;
import bitecode.modules.transaction.model.data.TransactionDetails;
import bitecode.modules.transaction.model.mapper.TransactionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/transactions")
@AdminAccess
@RequiredArgsConstructor
public class AdminTransactionController {
    private final TransactionService transactionService;
    private final TransactionMapper mapper;

    @GetMapping
    public PagedModel<TransactionDetails> findAllTransactions(Pageable pageable,
                                                              @RequestParam(required = false) String status,
                                                              @RequestParam(required = false) Instant startDate,
                                                              @RequestParam(required = false) Instant endDate) {
        var criteria = TransactionCriteria.builder()
                .startDate(startDate)
                .endDate(endDate);
        try {
            if (status != null) {
                if ("INCOMPLETE".equals(status)) {
                    criteria.statusNot(TransactionStatus.COMPLETED);
                } else {
                    criteria.status(TransactionStatus.valueOf(status));
                }
            }
        } catch (Exception e) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST);
        }

        return new PagedModel<>(
                transactionService.findAllTransactionsByCriteria(pageable, criteria.build())
                        .map(mapper::toTransactionDetails)
        );
    }

    @GetMapping("/statistics")
    public Map<String, Long> getRequestFiltersTotalElems() {
        return transactionService.getFiltersTotalElemsCount();
    }

    @GetMapping("/{id}")
    public TransactionDetails getTransaction(@PathVariable UUID id, @RequestParam(defaultValue = "false") boolean includeEvents) {
        return transactionService.getTransaction(id, includeEvents)
                .map(mapper::toTransactionDetails)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
    }
}
