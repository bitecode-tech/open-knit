package bitecode.modules.payment.subscription.model.enums;

import org.springframework.data.util.Pair;

import java.util.EnumSet;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

//explanation
//https://docs.stripe.com/billing/subscriptions/overview#subscription-statuses
public enum SubscriptionStatus {
    PENDING, // awaits for user action
    ACTIVE,
    INACTIVE,
    PAUSED,
    PAST_DUE,
    UNPAID,
    CANCELLING, // waiting for async provider confirmation
    CANCELED;

    private static final Map<String, SubscriptionStatus> ENUM_MAP;

    static {
        ENUM_MAP = EnumSet.allOf(SubscriptionStatus.class)
                .stream()
                .flatMap(statusEnum -> {
                    var enumStr = statusEnum.toString();
                    return Stream.of(Pair.of(enumStr, statusEnum), Pair.of(enumStr.toLowerCase(), statusEnum));
                })
                .collect(Collectors.toMap(Pair::getFirst, Pair::getSecond));

    }

    public static SubscriptionStatus of(String str) {
        return ENUM_MAP.get(str);
    }
}
