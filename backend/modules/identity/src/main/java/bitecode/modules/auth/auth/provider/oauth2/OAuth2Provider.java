package bitecode.modules.auth.auth.provider.oauth2;

import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Map;

public interface OAuth2Provider {
    String getProviderId();

    String getProviderUserId(OAuth2User oAuth2User);

    String getEmail(OAuth2User oAuth2User);

    Map<String, Object> getAttributes(OAuth2User oAuth2User);
} 