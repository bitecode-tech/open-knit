import SubscriptionClient from "@payment/clients/http/SubscriptionClient.ts";
import {Subscription} from "@payment/types/model/Subscription.ts";
import {SetUpSubscriptionResponse} from "@payment/types/response/SetUpSubscriptionResponse.ts";

class SubscriptionService {
    public QUERY_KEYS = {
        GET_SUBSCRIPTIONS: () => ['subscriptions'] as const,
        GET_SUBSCRIPTION_PLANS: () => ['subscription-plans'] as const,
    }

    async getSubscriptions(): Promise<Subscription[]> {
        return SubscriptionClient.getSubscriptions()
            .then(resp => resp.data);
    }

    async initSubscription(subscriptionPlanId: string): Promise<SetUpSubscriptionResponse> {
        return SubscriptionClient.initSubscription(subscriptionPlanId)
            .then(resp => resp.data);
    }

    async createAndInitSubscription(subscriptionPlanId: string): Promise<SetUpSubscriptionResponse> {
        return SubscriptionClient.createAndInitSubscription(subscriptionPlanId)
            .then(resp => resp.data);
    }

    async cancelSubscription(subscriptionPlanId: string): Promise<void> {
        await SubscriptionClient.cancelSubscription(subscriptionPlanId);
    }
}

export default new SubscriptionService();