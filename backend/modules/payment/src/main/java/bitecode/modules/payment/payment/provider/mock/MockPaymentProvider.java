package bitecode.modules.payment.payment.provider.mock;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules.payment.payment.model.ExecutePaymentData;
import bitecode.modules.payment.payment.provider.PaymentProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

import static bitecode.modules._common.model.enums.EnvProfile._PROD_;

@Component
@Slf4j
@RequiredArgsConstructor
@Profile("!" + _PROD_)
public class MockPaymentProvider implements PaymentProvider {

    @Override
    public ExecutePaymentData executePayment(UUID paymentId, BigDecimal amount, String currency) {
        var extRefId = UUID.randomUUID().toString();
        return new ExecutePaymentData(PaymentStatus.CONFIRMED, extRefId, PaymentGateway.MOCK, null);
    }

    @Override
    public PaymentGateway paymentGateway() {
        return PaymentGateway.MOCK;
    }
}
