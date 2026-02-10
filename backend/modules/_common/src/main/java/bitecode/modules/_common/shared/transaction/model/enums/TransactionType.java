package bitecode.modules._common.shared.transaction.model.enums;

public enum TransactionType {
    BUY, // buys into his wallet, ie. external FIAT for internal FIAT/COIN/PRODUCT
    PAYMENT,
    REFUND,
    COUPON,
    SUBSCRIPTION_PAYMENT,
}
