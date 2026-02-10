import {AxiosResponse} from "axios";
import AdminSubscriptionClient from "@payment/clients/http/AdminSubscriptionClient.ts";
import {NewSubscriptionPlanRequest} from "@payment/types/request/NewSubscriptionPlanRequest.ts";
import {Subscription} from "@payment/types/model/Subscription.ts";
import {UpdateSubscriptionPlanRequest} from "@payment/types/request/UpdateSubscriptionPlanRequest.ts";
import {PagedRequest} from "@common/model/PagedRequest.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {SubscriptionPlan} from "@payment/types/model/SubscriptionPlan.ts";

type UserId = string;

class AdminSubscriptionService {
    public QUERY_KEYS = {
        GET_USERS_WITH_SUBSCRIPTIONS: (page: number, pageSize: number, filters?: {}) => ['admin-users-with-subscriptions', page, pageSize, JSON.stringify(filters)] as const,
        GET_SUBSCRIPTION_PLANS: (page: number, pageSize: number) => ['admin-subscription-plans', page, pageSize] as const,
        GET_SUBSCRIPTION_PLANS_INVALIDATE: () => ['admin-subscription-plans'] as const,
    }

    public async getSubscriptionPlans(request: PagedRequest<void>): Promise<PagedResponse<SubscriptionPlan>> {
        return AdminSubscriptionClient.getSubscriptionPlans(request)
            .then(value => value.data);
    }

    public async getUsersActiveSubscriptions(userIds: UserId[]): Promise<Map<UserId, Subscription[]>> {
        const resp = await AdminSubscriptionClient.getSubscriptions(userIds, true);
        const map = new Map<string, Subscription[]>();

        for (const subscription of resp) {
            const userId = subscription.userId;
            if (!map.has(userId)) {
                map.set(userId, []);
            }
            map.get(userId)!.push(subscription);
        }

        return map;
    }

    async createPendingSubscriptionForUser(userId: string, subscriptionPlanId: string) {
        return await AdminSubscriptionClient.setPendingUserSubscription({userId, subscriptionPlanId})
            .then(resp => resp.data);
    }

    async createNewSubscriptionPlan(request: NewSubscriptionPlanRequest): Promise<AxiosResponse<void>> {
        return AdminSubscriptionClient.createNewSubscriptionPlan(request);
    }

    async updateSubscriptionPlanRequest(subscriptionPlanId: string, request: UpdateSubscriptionPlanRequest): Promise<AxiosResponse<void>> {
        return AdminSubscriptionClient.updateSubscriptionPlanRequest(subscriptionPlanId, request);
    }
}

export default new AdminSubscriptionService();