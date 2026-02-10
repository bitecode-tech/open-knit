package bitecode.modules._common.shared.identity.user.model;

import org.springframework.security.core.userdetails.UserDetails;

import java.util.UUID;

public interface PrincipalDetails extends UserDetails {
    UUID getUuid();
}
