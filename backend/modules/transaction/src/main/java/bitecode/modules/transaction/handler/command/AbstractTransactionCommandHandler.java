package bitecode.modules.transaction.handler.command;

import bitecode.modules._common.eventsourcing.model.AbstractCommandHandler;
import bitecode.modules._common.eventsourcing.model.Command;
import bitecode.modules.transaction.model.entity.Transaction;

public abstract class AbstractTransactionCommandHandler<T extends Command> extends AbstractCommandHandler<Transaction, T> {

}
