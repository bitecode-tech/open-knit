import {PaymentHistory} from "@payment/types/model/PaymentHistory.ts";

export interface Payment {
    uuid: string;
    userId: string;
    transactionId: string;
    amount: string;
    currency: string;
    gatewayId: string;
    gateway: string;
    status: string;
    type: string;
    createdDate: string,
    history?: PaymentHistory[];
}