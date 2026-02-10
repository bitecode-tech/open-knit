package bitecode.modules.payment.payment.model;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;

public record ExecutePaymentData(
        PaymentStatus paymentStatus,
        String externalReferenceId,
        PaymentGateway paymentGateway,
        String redirectUrl
) {
}
