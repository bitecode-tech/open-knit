import {AxiosInstance} from "axios";
import {adminBaseConfig} from "@common/config/AxiosConfig";
import AuthService from "@identity/auth/services/AuthService.ts";
import {Subscription} from "@payment/types/model/Subscription.ts";
import {CreatePendingSubscriptionForUser} from "@payment/types/admin/CreatePendingSubscriptionForUser.ts";
import {NewSubscriptionPlanRequest} from "@payment/types/request/NewSubscriptionPlanRequest.ts";
import {UpdateSubscriptionPlanRequest} from "@payment/types/request/UpdateSubscriptionPlanRequest.ts";
import {SubscriptionPlan} from "@payment/types/model/SubscriptionPlan.ts";
import {PagedRequest} from "@common/model/PagedRequest.ts";
import {PagedResponse} from "@common/model/PagedResponse.ts";
import {PlanSubscriptionsCount} from "@payment/types/model/PlanCount.ts";

class SubscriptionClient {
    private axios: AxiosInstance;

    constructor() {
        this.axios = AuthService.createAuthenticatedClientInstance(adminBaseConfig, "/subscriptions");
    }

    async getSubscriptions(userIds: string[], active: boolean) {
        return this.axios.get<Subscription[]>("", {
            params: {
                userIds, active
            }
        }).then(resp => resp.data);
    }

    async getActiveSubscriptionsCount(subscriptionPlanIds: string[]) {
        return this.axios.get<PlanSubscriptionsCount[]>("/plans/active-count", {
            params: {
                subscriptionPlanIds
            }
        });
    }

    async setPendingUserSubscription(request: CreatePendingSubscriptionForUser) {
        return this.axios.post<Subscription[]>("", request)
    }

    async getSubscriptionPlans(request: PagedRequest<void>) {
        return this.axios.get<PagedResponse<SubscriptionPlan>>("/plans", {
            params: {
                ...request.page
            }
        });
    }

    async createNewSubscriptionPlan(request: NewSubscriptionPlanRequest) {
        return this.axios.post<void>("/plans", request);
    }

    async updateSubscriptionPlanRequest(planId: string, request: UpdateSubscriptionPlanRequest) {
        return this.axios.patch<void>(`/plans/${planId}`, request);
    }
}

export default new SubscriptionClient();
