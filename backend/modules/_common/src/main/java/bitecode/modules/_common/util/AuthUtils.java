package bitecode.modules._common.util;

import bitecode.modules._common.shared.identity.user.model.PrincipalDetails;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class AuthUtils {

    public static UUID getUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication();
        if (principal == null || principal instanceof AnonymousAuthenticationToken) {
            throw new AuthenticationServiceException("Anonymous authentication required");
        }
        var user = ((PrincipalDetails) ((UsernamePasswordAuthenticationToken) principal).getPrincipal());
        return user.getUuid();
    }
}
