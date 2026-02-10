package bitecode.modules.transaction.handler.command;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules._common.model.event.ModuleEvent;
import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionSubstatus;
import bitecode.modules.transaction.model.command.CreateNewTransactionCommand;
import bitecode.modules.transaction.model.entity.Transaction;
import bitecode.modules.transaction.model.mapper.TransactionMapper;
import bitecode.modules.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class CreateNewTransactionCommandHandler extends AbstractTransactionCommandHandler<CreateNewTransactionCommand> {
    private final TransactionRepository repository;
    private final TransactionMapper mapper;

    @Override
    public Transaction handle(CreateNewTransactionCommand command, Map<String, Object> params) throws UnappliedCommandException {
        var txn = mapper.toTransaction(command);
        txn.setStatus(TransactionStatus.PENDING);
        txn.setSubStatus(command.subStatus() == null ? TransactionSubstatus.DONE : command.subStatus());
        return repository.save(txn);
    }

    @Override
    public ModuleEvent toModuleEvent(CreateNewTransactionCommand command, Transaction object, Map<String, Object> params) {
        return mapper.toNewTransactionCreatedCommand(object);
    }

    @Override
    public Class<CreateNewTransactionCommand> getCommandClass() {
        return CreateNewTransactionCommand.class;
    }
}
