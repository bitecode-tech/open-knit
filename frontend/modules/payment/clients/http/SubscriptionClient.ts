import {AxiosInstance} from "axios";
import {baseConfig} from "@common/config/AxiosConfig";
import AuthService from "@identity/auth/services/AuthService.ts";
import {SetUpSubscriptionResponse} from "@payment/types/response/SetUpSubscriptionResponse.ts";
import {Subscription} from "@payment/types/model/Subscription.ts";

class SubscriptionClient {
    private axios: AxiosInstance;

    constructor() {
        this.axios = AuthService.createAuthenticatedClientInstance(baseConfig, "/subscriptions");
    }

    async initSubscription(subscriptionPlanId: string) {
        return this.axios.post<SetUpSubscriptionResponse>("", {subscriptionPlanId});
    }

    async createAndInitSubscription(subscriptionPlanId: string) {
        return this.axios.put<SetUpSubscriptionResponse>("", {subscriptionPlanId});
    }

    async getSubscriptions() {
        return this.axios.get<Subscription[]>("");
    }

    async cancelSubscription(subscriptionId: string) {
        return this.axios.delete<Subscription[]>(`/${subscriptionId}`);
    }

}

export default new SubscriptionClient();
