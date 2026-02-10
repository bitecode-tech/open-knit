package bitecode.modules.payment.payment.model.response;

import lombok.Builder;

@Builder
public record SetUpSubscriptionResponse(
        String redirectUrl
) {
}
