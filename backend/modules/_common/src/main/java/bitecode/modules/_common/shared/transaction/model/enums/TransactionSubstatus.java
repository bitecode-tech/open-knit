package bitecode.modules._common.shared.transaction.model.enums;

public enum TransactionSubstatus {
    AWAITS_PAYMENT_GATEWAY_UPDATE,
    PAYMENT_RECEIVED,
    PAYMENT_ERROR,
    PAYMENT_REJECTED,
    DONE
}
