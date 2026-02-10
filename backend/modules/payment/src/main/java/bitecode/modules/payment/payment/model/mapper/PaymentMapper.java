package bitecode.modules.payment.payment.model.mapper;

import bitecode.modules._common.shared.payment.model.event.PaymentCreatedEvent;
import bitecode.modules.payment.payment.model.data.details.PaymentDetails;
import bitecode.modules.payment.payment.model.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = {PaymentHistoryMapper.class})
public interface PaymentMapper {
    @Mapping(source = "uuid", target = "paymentId")
    PaymentCreatedEvent toPaymentCreatedCommand(Payment payment);

    @Mapping(target = "history", source = "paymentHistoryList")
    PaymentDetails toPaymentDetails(Payment payment);
}
