package bitecode.modules.transaction.repository;

import bitecode.modules._common.eventsourcing.model.GenericCommandHandler;
import bitecode.modules.transaction.handler.command.AbstractTransactionCommandHandler;
import bitecode.modules.transaction.model.command.AbstractTransactionCommand;
import bitecode.modules.transaction.model.data.TransactionDetails;
import bitecode.modules.transaction.model.entity.Transaction;
import bitecode.modules.transaction.model.entity.TransactionEvent;
import bitecode.modules.transaction.model.mapper.TransactionMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@Slf4j
public class TransactionCommandHandler extends GenericCommandHandler<AbstractTransactionCommand, Transaction, AbstractTransactionCommandHandler<AbstractTransactionCommand>, TransactionEvent, TransactionDetails> {
    private final TransactionMapper transactionMapper;

    @SuppressWarnings("unchecked")
    public TransactionCommandHandler(
            List<AbstractTransactionCommandHandler<?>> eventHandlers, TransactionMapper transactionMapper,
            TransactionEventRepository repository, ApplicationEventPublisher eventPublisher) {
        super(eventHandlers, repository, eventPublisher);
        this.transactionMapper = transactionMapper;
    }

    @Override
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<TransactionDetails> handle(AbstractTransactionCommand command) {
        return super.handle(command);
    }

    @Override
    protected TransactionEvent toEventEntity(AbstractTransactionCommand command, Transaction entity, Map<String, Object> params) {
        return TransactionEvent.builder()
                .transactionId(entity.getId())
                .eventData(command)
                .eventName(command.getClass().getSimpleName())
                .build();
    }

    @Override
    protected TransactionDetails toReturnType(Transaction entity) {
        return transactionMapper.toTransactionDetails(entity);
    }

    @Override
    protected Class<AbstractTransactionCommand> getGenericCommandTypeClass() {
        return AbstractTransactionCommand.class;
    }
}
