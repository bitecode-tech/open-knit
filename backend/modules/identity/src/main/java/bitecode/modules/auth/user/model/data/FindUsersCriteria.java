package bitecode.modules.auth.user.model.data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record FindUsersCriteria(
        Boolean includeUserData,
        List<UUID> userIds,
        Boolean emailConfirmed,
        Instant startDate,
        Instant endDate
) {
    public FindUsersCriteria {
        if (includeUserData == null) includeUserData = false;
    }
}
