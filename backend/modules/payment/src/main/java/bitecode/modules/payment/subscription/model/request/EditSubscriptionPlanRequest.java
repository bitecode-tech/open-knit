package bitecode.modules.payment.subscription.model.request;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Builder
public record EditSubscriptionPlanRequest(
//        @NotBlank
        String name,
        @PositiveOrZero
        BigDecimal price,
//        @NotNull
        ChronoUnit paymentFrequencyType,
//        @PositiveOrZero
        Integer paymentFrequency
) {
}
