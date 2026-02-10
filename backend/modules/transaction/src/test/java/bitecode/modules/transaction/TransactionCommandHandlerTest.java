package bitecode.modules.transaction;

import bitecode.modules._common.shared.transaction.model.enums.*;
import bitecode.modules.transaction._config.TransactionIntegrationTest;
import bitecode.modules.transaction.model.command.CreateNewTransactionCommand;
import bitecode.modules.transaction.repository.TransactionCommandHandler;
import bitecode.modules.transaction.repository.TransactionEventRepository;
import bitecode.modules.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class TransactionCommandHandlerTest extends TransactionIntegrationTest {

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
    public void shouldCreateNewTransaction() {
        // given
        var userId = UUID.randomUUID();
        var newTxnEvent = CreateNewTransactionCommand.builder()
                .userId(userId)
                .type(TransactionType.PAYMENT)
                .debitTotal(BigDecimal.valueOf(123.319))
                .debitType(TransactionDebitType.BANK_TRANSFER)
                .debitSubtype("debitSubType")
                .debitReferenceId("debitReferencedId")
                .debitCurrency("PLN")
                .creditTotal(BigDecimal.valueOf(32.123))
                .creditType(TransactionCreditType.WALLET)
                .creditSubtype("creditSubType")
                .creditReferenceId("creditReferenceId")
                .creditCurrency("PLN")
                .build();
        // when
        transactionCommandHandler.handle(newTxnEvent);

        // then
        var txns = transactionRepository.findAllByUserId(userId);
        assertThat(txns.size(), is(1));
        var txn = txns.getFirst();

        assertThat(txn, allOf(
                hasProperty("userId", is(userId)),
                hasProperty("type", is(TransactionType.PAYMENT)),
                hasProperty("status", is(TransactionStatus.PENDING)),
                hasProperty("subStatus", is(TransactionSubstatus.DONE)),
                hasProperty("debitTotal", is(BigDecimal.valueOf(123.32))),
                hasProperty("debitType", is(TransactionDebitType.BANK_TRANSFER)),
                hasProperty("debitSubtype", is("debitSubType")),
                hasProperty("debitReferenceId", is("debitReferencedId")),
                hasProperty("creditTotal", is(BigDecimal.valueOf(32.12))),
                hasProperty("creditType", is(TransactionCreditType.WALLET)),
                hasProperty("creditSubtype", is("creditSubType")),
                hasProperty("creditReferenceId", is("creditReferenceId")),
                hasProperty("creditCurrency", is("PLN"))
        ));

        var txnEvents = transactionEventRepository.findAllByTransactionId(txn.getId());
        assertThat(txnEvents.size(), is(1));
        var txnEvent = txnEvents.getFirst();
        assertThat(txnEvent.getEventData(), equalTo(newTxnEvent));
    }

    @Test
    @Transactional
    public void shouldCreateNewTransactionUsingEventListener() {
        // given
        var userId = UUID.randomUUID();
        var newTxnEvent = CreateNewTransactionCommand.builder()
                .userId(userId)
                .type(TransactionType.PAYMENT)
                .debitTotal(BigDecimal.valueOf(123.319))
                .debitType(TransactionDebitType.BANK_TRANSFER)
                .debitSubtype("debitSubType")
                .debitReferenceId("debitReferencedId")
                .debitCurrency("PLN")
                .creditTotal(BigDecimal.valueOf(32.123))
                .creditType(TransactionCreditType.WALLET)
                .creditSubtype("creditSubType")
                .creditReferenceId("creditReferenceId")
                .creditCurrency("PLN")
                .build();
        // when
        eventPublisher.publishEvent(newTxnEvent);

        // then
        var txns = transactionRepository.findAllByUserId(userId);
        assertThat(txns.size(), is(1));
        var txn = txns.getFirst();

        assertThat(txn, allOf(
                hasProperty("userId", is(userId)),
                hasProperty("type", is(TransactionType.PAYMENT)),
                hasProperty("status", is(TransactionStatus.PENDING)),
                hasProperty("subStatus", is(TransactionSubstatus.DONE)),
                hasProperty("debitTotal", is(BigDecimal.valueOf(123.32))),
                hasProperty("debitType", is(TransactionDebitType.BANK_TRANSFER)),
                hasProperty("debitSubtype", is("debitSubType")),
                hasProperty("debitReferenceId", is("debitReferencedId")),
                hasProperty("creditTotal", is(BigDecimal.valueOf(32.12))),
                hasProperty("creditType", is(TransactionCreditType.WALLET)),
                hasProperty("creditSubtype", is("creditSubType")),
                hasProperty("creditReferenceId", is("creditReferenceId")),
                hasProperty("creditCurrency", is("PLN"))
        ));

        var txnEvents = transactionEventRepository.findAllByTransactionId(txn.getId());
        assertThat(txnEvents.size(), is(1));
        var txnEvent = txnEvents.getFirst();
        assertThat(txnEvent.getEventData(), equalTo(newTxnEvent));
    }
}
