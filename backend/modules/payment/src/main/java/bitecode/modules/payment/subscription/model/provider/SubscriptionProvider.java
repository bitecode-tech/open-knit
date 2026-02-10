package bitecode.modules.payment.subscription.model.provider;

import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules.payment.subscription.model.data.UpdateSubscriptionPlanData;
import bitecode.modules.payment.subscription.model.entity.SubscriptionPlan;
import bitecode.modules.payment.subscription.model.enums.SubscriptionStatus;

public interface SubscriptionProvider {

    InitSubscriptionResult initSubscription(SubscriptionPlan subscriptionPlan, UserDetails userDetails);

    SubscriptionStatus cancelSubscription(String externalId);

    void createSubscriptionPlan(SubscriptionPlan subscriptionPlan);

    void updateSubscriptionPlan(SubscriptionPlan subscriptionPlan, UpdateSubscriptionPlanData updateData);

    PaymentGateway paymentGateway();
}
