import {TransactionEventDetails} from "@transaction/types/TransactionEventDetails.ts";

export interface TransactionDetails {
    uuid: string;
    userId: string;
    quoteId: string;
    paymentId: string;
    type: string;
    status: "PENDING" | "COMPLETED" | "ERROR" | "CANCELLED" | string;
    subStatus: string;
    debitTotal: number;
    debitType: string;
    debitSubtype: string;
    debitCurrency: string,
    creditTotal: number;
    creditType: string;
    creditSubtype: string;
    creditCurrency: string;
    creditReferenceId: string;
    createdDate: string;
    updatedDate: string;
    events?: TransactionEventDetails[]
}