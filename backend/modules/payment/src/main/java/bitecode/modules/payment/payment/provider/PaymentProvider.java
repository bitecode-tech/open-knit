package bitecode.modules.payment.payment.provider;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules.payment.payment.model.ExecutePaymentData;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentProvider {
    ExecutePaymentData executePayment(UUID paymentId, BigDecimal amount, String currency);

    PaymentGateway paymentGateway();
}
