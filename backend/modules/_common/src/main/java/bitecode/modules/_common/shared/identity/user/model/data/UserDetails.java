package bitecode.modules._common.shared.identity.user.model.data;

import bitecode.modules._common.shared.identity.auth.model.enums.MfaMethod;
import lombok.Builder;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Builder
public record UserDetails(
        UUID uuid,
        String email,
        Set<String> roles,
        boolean emailConfirmed,
        boolean mfaEnabled,
        MfaMethod mfaMethod,
        UserDataDetails userData,
        Instant createdDate,
        boolean emptyPassword
) {
}