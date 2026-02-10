import {PaymentFrequencyType} from "@payment/types/model/PaymentFrequencyType.ts";

export interface SubscriptionPlan {
    uuid: string
    name: string,
    price: number,
    currency: string
    paymentFrequencyType: PaymentFrequencyType
    paymentFrequency: number
}