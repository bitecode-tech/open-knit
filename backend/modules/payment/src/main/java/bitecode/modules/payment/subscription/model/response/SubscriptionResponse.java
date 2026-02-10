package bitecode.modules.payment.subscription.model.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionResponse {
    private UUID id;
    private UUID userId;
    private String planName;
    private BigDecimal amount;
    private String currency;
    private String status;
    private ZonedDateTime nextPaymentDate;
}
