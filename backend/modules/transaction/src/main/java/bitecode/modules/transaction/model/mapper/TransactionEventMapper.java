package bitecode.modules.transaction.model.mapper;

import bitecode.modules.transaction.model.data.TransactionEventDetails;
import bitecode.modules.transaction.model.entity.TransactionEvent;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface TransactionEventMapper {
    TransactionEventDetails toTransactionEventDetails(TransactionEvent transaction);
}
