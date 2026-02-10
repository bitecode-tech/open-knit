import {SubscriptionHistory} from "@payment/types/model/SubscriptionHistory.ts";
import {SubscriptionPlan} from "@payment/types/model/SubscriptionPlan.ts";
import {SubscriptionStatus} from "@payment/types/model/SubscriptionStatus.ts";

export interface Subscription {
    uuid: string,
    userId: string,
    currency: string,
    status: SubscriptionStatus,
    nextPaymentDate: string,
    subscriptionPlan?: SubscriptionPlan
    subscriptionHistory: SubscriptionHistory[]
}