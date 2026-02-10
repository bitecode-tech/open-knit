package bitecode.modules.payment.payment.model.mapper;

import bitecode.modules.payment.payment.model.data.details.PaymentHistoryDetails;
import bitecode.modules.payment.payment.model.entity.PaymentHistory;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PaymentHistoryMapper {

    PaymentHistoryDetails toPaymentHistoryDetails(PaymentHistory paymentHistory);
}
