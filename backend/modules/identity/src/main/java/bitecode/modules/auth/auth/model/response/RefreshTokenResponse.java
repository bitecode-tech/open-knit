package bitecode.modules.auth.auth.model.response;

import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import lombok.Builder;

@Builder
public record RefreshTokenResponse(
        UserDetails user,
        String accessToken
) {
}
