package bitecode.modules.auth.auth.model.response;

import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import bitecode.modules.auth.auth.model.enums.MfaMethod;
import jakarta.annotation.Nullable;
import lombok.Builder;

@Builder
public record SignInResponse(
        @Nullable
        UserDetails user,
        @Nullable
        String accessToken,
        @Nullable
        Boolean mfaRequired,
        @Nullable
        MfaMethod mfaMethod,
        Boolean emailVerificationRequired
) {
}
