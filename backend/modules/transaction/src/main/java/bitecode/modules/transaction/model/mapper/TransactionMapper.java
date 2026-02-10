package bitecode.modules.transaction.model.mapper;

import bitecode.modules._common.shared.transaction.model.event.TransactionCreatedEvent;
import bitecode.modules._common.shared.transaction.model.event.TransactionStatusUpdatedEvent;
import bitecode.modules.transaction.model.command.CreateNewTransactionCommand;
import bitecode.modules.transaction.model.data.TransactionDetails;
import bitecode.modules.transaction.model.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {TransactionEventMapper.class})
public interface TransactionMapper {
    TransactionDetails toTransactionDetails(Transaction transaction);

    TransactionCreatedEvent toNewTransactionCreatedCommand(Transaction transaction);

    Transaction toTransaction(CreateNewTransactionCommand event);

    TransactionStatusUpdatedEvent toTransactionStatusUpdatedCommand(Transaction transaction);
}
