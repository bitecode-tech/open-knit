import {PaymentFrequencyType} from "@payment/types/model/PaymentFrequencyType.ts";

export interface NewSubscriptionPlanRequest {
    name: string,
    price: number,
    currency: string,
    paymentFrequencyType: PaymentFrequencyType
    paymentFrequency: number
}