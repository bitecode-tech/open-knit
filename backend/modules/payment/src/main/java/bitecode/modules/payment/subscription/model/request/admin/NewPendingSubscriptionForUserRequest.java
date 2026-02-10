package bitecode.modules.payment.subscription.model.request.admin;

import lombok.Builder;

import java.util.UUID;

@Builder
public record NewPendingSubscriptionForUserRequest(
        UUID userId,
        UUID subscriptionPlanId
) {
}
