package bitecode.modules.payment.subscription.model.mapper;

import bitecode.modules.payment.subscription.model.data.SubscriptionPlanDetails;
import bitecode.modules.payment.subscription.model.entity.SubscriptionPlan;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubscriptionPlanMapper {
    SubscriptionPlanDetails toSubscriptionPlanDetails(SubscriptionPlan subscriptionPlan);
}
