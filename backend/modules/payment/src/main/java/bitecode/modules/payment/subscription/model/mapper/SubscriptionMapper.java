package bitecode.modules.payment.subscription.model.mapper;

import bitecode.modules.payment.subscription.model.entity.Subscription;
import bitecode.modules.payment.subscription.model.entity.SubscriptionPlan;
import bitecode.modules.payment.subscription.model.request.EditSubscriptionPlanRequest;
import bitecode.modules.payment.subscription.model.request.NewSubscriptionPlanRequest;
import bitecode.modules.payment.subscription.model.response.SubscriptionResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SubscriptionMapper {
    @Mapping(target = "id", source = "uuid")
    SubscriptionResponse toSubscriptionResponse(Subscription subscription);

    SubscriptionPlan toSubscriptionPlan(NewSubscriptionPlanRequest request);

    void updateSubscriptionPlan(EditSubscriptionPlanRequest request, @MappingTarget SubscriptionPlan entity);
}