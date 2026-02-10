package bitecode.modules.transaction.handler.command;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules.transaction.model.command.UpdateTransactionStatusCommand;
import bitecode.modules.transaction.model.entity.Transaction;
import bitecode.modules.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class UpdateTransactionStatusCommandHandler extends AbstractTransactionCommandHandler<UpdateTransactionStatusCommand> {
    private final TransactionRepository repository;

    @Override
    public Transaction handle(UpdateTransactionStatusCommand command, Map<String, Object> params) throws UnappliedCommandException {
        var txn = repository.findByUuid(command.uuid())
                .orElseThrow(() -> new UnappliedCommandException("Could not find transaction of id=%s", command.uuid()));
        if (command.status() != null) {
            txn.setStatus(command.status());
        }
        txn.setSubStatus(command.subStatus());
        return repository.save(txn);
    }

    @Override
    public Class<UpdateTransactionStatusCommand> getCommandClass() {
        return UpdateTransactionStatusCommand.class;
    }
}
