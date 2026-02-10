package bitecode.modules.payment.payment.model.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

@Builder
public record SetUpSubscriptionRequest(
        @NotNull
        UUID subscriptionPlanId
) {
}
