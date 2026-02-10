package bitecode.modules.auth.auth.provider.oauth2;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class OAuth2GoogleProvider implements OAuth2Provider {
    @Override
    public String getProviderId() {
        return "google";
    }

    @Override
    public String getProviderUserId(OAuth2User oAuth2User) {
        return oAuth2User.getAttribute("sub");
    }

    @Override
    public String getEmail(OAuth2User oAuth2User) {
        return oAuth2User.getAttribute("email");
    }

    @Override
    public Map<String, Object> getAttributes(OAuth2User oAuth2User) {
        return oAuth2User.getAttributes();
    }
} 