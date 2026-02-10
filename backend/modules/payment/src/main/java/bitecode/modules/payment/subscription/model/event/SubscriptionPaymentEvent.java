package bitecode.modules.payment.subscription.model.event;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPaymentEvent {
    private Long subscriptionId;
    private UUID userId;
    private String planName;
    private Double amount;
    private String currency;
}