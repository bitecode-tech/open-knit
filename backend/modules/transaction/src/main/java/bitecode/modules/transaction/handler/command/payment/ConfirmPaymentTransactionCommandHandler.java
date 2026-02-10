package bitecode.modules.transaction.handler.command.payment;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules._common.model.event.ModuleEvent;
import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionSubstatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionType;
import bitecode.modules.transaction.handler.command.AbstractTransactionCommandHandler;
import bitecode.modules.transaction.model.command.payment.ConfirmPaymentTransactionCommand;
import bitecode.modules.transaction.model.entity.Transaction;
import bitecode.modules.transaction.model.mapper.TransactionMapper;
import bitecode.modules.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class ConfirmPaymentTransactionCommandHandler extends AbstractTransactionCommandHandler<ConfirmPaymentTransactionCommand> {
    private final TransactionRepository repository;
    private final TransactionMapper mapper;

    @Override
    public Transaction handle(ConfirmPaymentTransactionCommand command, Map<String, Object> params) throws UnappliedCommandException {
        var txn = repository.findByUuid(command.uuid())
                .orElseThrow(() -> new UnappliedCommandException("Could not find transaction of id=%s", command.uuid()));
        if (TransactionType.SUBSCRIPTION_PAYMENT.equals(txn.getType())) {
            txn.setStatus(TransactionStatus.COMPLETED);
            txn.setSubStatus(TransactionSubstatus.DONE);
        } else {
            txn.setStatus(TransactionStatus.PENDING);
            txn.setSubStatus(TransactionSubstatus.PAYMENT_RECEIVED);
        }
        return repository.save(txn);
    }

    @Override
    public ModuleEvent toModuleEvent(ConfirmPaymentTransactionCommand command, Transaction object, Map<String, Object> params) {
        return mapper.toTransactionStatusUpdatedCommand(object);
    }

    @Override
    public Class<ConfirmPaymentTransactionCommand> getCommandClass() {
        return ConfirmPaymentTransactionCommand.class;
    }
}
