package bitecode.modules._common.shared.payment.model.enums;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public enum PaymentStatus {
    NEW(0),
    ERROR(1),
    PENDING(1),
    REJECTED(3),
    ABANDONED(4),
    CONFIRMED(5),
    EXPIRED(5);

    private static final Map<String, PaymentStatus> STRING_TO_ENUM_MAP;

    static {
        STRING_TO_ENUM_MAP = Arrays.stream(PaymentStatus.values())
                .collect(Collectors.toMap(Enum::toString, Function.identity()));
    }

    private final int level; // status can be updated only to higher level

    public boolean canUpdateOldStatus(PaymentStatus old) {
        return old.level < this.level;
    }

    public static PaymentStatus of(String name) {
        var enumType = STRING_TO_ENUM_MAP.get(name);
        if (enumType == null) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, name);
        }
        return enumType;
    }
}
