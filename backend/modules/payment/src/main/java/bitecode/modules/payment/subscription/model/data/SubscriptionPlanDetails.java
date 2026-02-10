package bitecode.modules.payment.subscription.model.data;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Builder
public record SubscriptionPlanDetails(
        UUID uuid,
        String name,
        String currency,
        BigDecimal price,
        ChronoUnit paymentFrequencyType,
        Long paymentFrequency
) {
}