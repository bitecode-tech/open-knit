package bitecode.modules.payment.payment.model.data;

import bitecode.modules.payment.subscription.model.enums.SubscriptionStatus;
import lombok.Builder;
import org.springframework.lang.Nullable;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record SubscriptionUpdateData(
        @Nullable
        UUID subscriptionId,
        String externalId,
        SubscriptionStatus status,
        @Nullable
        BigDecimal amount,
        Instant modifiedAt
) {
}
