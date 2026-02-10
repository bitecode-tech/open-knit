package bitecode.modules.auth.auth.model.data;

import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import bitecode.modules.auth.auth.model.entity.RefreshToken;
import bitecode.modules.auth.auth.model.enums.MfaMethod;
import lombok.Builder;

@Builder
public record AuthenticatedUserDetails(
        UserDetails user,
        RefreshToken refreshToken,
        String accessToken,
        Boolean mfaRequired,
        MfaMethod mfaMethod,
        Boolean emailVerificationRequired
) {

}
