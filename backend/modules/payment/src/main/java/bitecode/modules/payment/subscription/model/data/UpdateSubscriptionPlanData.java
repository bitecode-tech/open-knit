package bitecode.modules.payment.subscription.model.data;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record UpdateSubscriptionPlanData(
        BigDecimal newPrice
) {

}
