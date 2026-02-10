package bitecode.modules.payment.subscription.model.provider;

import lombok.Builder;
import org.springframework.lang.Nullable;

@Builder
public record InitSubscriptionResult(
        @Nullable
        String redirectUrl
) {
}
