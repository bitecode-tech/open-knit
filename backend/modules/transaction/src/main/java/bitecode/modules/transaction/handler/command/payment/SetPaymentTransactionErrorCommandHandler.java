package bitecode.modules.transaction.handler.command.payment;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules._common.model.event.ModuleEvent;
import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionSubstatus;
import bitecode.modules.transaction.handler.command.AbstractTransactionCommandHandler;
import bitecode.modules.transaction.model.command.payment.SetPaymentTransactionErrorCommand;
import bitecode.modules.transaction.model.entity.Transaction;
import bitecode.modules.transaction.model.mapper.TransactionMapper;
import bitecode.modules.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class SetPaymentTransactionErrorCommandHandler extends AbstractTransactionCommandHandler<SetPaymentTransactionErrorCommand> {
    private final TransactionRepository repository;
    private final TransactionMapper mapper;

    @Override
    public Transaction handle(SetPaymentTransactionErrorCommand command, Map<String, Object> params) throws UnappliedCommandException {
        var txn = repository.findByUuid(command.uuid())
                .orElseThrow(() -> new UnappliedCommandException("Could not find transaction of id=%s", command.uuid()));
        txn.setStatus(TransactionStatus.ERROR);
        txn.setSubStatus(TransactionSubstatus.PAYMENT_ERROR);
        return repository.save(txn);
    }

    @Override
    public ModuleEvent toModuleEvent(SetPaymentTransactionErrorCommand command, Transaction object, Map<String, Object> params) {
        return mapper.toTransactionStatusUpdatedCommand(object);
    }

    @Override
    public Class<SetPaymentTransactionErrorCommand> getCommandClass() {
        return SetPaymentTransactionErrorCommand.class;
    }
}
