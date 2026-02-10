package bitecode.modules.payment.subscription.model.projection;

import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@Data
@RequiredArgsConstructor
public class PlanSubscriptionsCount {
    private final UUID planId;
    private final Long count;
}