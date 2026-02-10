package bitecode.modules.auth.auth;

import bitecode.modules._common.model.enums.EnvProfile;
import bitecode.modules.auth.auth.config.properties.AuthProperties;
import bitecode.modules.auth.auth.model.entity.OauthIdentity;
import bitecode.modules.auth.auth.provider.oauth2.OAuth2Provider;
import bitecode.modules.auth.auth.repository.OauthIdentityRepository;
import bitecode.modules.auth.user.UserService;
import bitecode.modules.auth.user.model.request.SignUpRequest;
import bitecode.modules.auth.user.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OAuth2ProvidersService implements OAuth2UserService<OidcUserRequest, OidcUser>, AuthenticationSuccessHandler {
    @Value("${spring.profiles.active:}")
    private EnvProfile activeProfile;

    private final OidcUserService oauth2Delegate = new OidcUserService();
    private final OauthIdentityRepository oauthIdentityRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthProperties properties;
    private Map<String, OAuth2Provider> providers;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) {
        var oAuth2User = oauth2Delegate.loadUser(userRequest);
        var registrationId = userRequest.getClientRegistration().getRegistrationId();
        var provider = providers.get(registrationId);
        if (provider == null) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Unsupported OAuth2 provider: " + registrationId);
        }

        var providerUserId = provider.getProviderUserId(oAuth2User);
        var email = provider.getEmail(oAuth2User);

        oauthIdentityRepository.findByProviderAndProviderUserId(registrationId, providerUserId)
                .orElseGet(() -> findAndLinkOrCreateNewUser(email, registrationId, providerUserId));
        return oAuth2User;
    }

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        var oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        var user = userService.findUserByEmail(email).orElseThrow();
        response.addCookie(AuthController.createRefreshTokenCookie(jwtService.generateRefreshToken(user, false), activeProfile));

        response.sendRedirect(properties.getApp().getFrontendUrl() + "/oauth2/success?token=" + jwtService.generateAccessToken(user));
    }

    private OauthIdentity findAndLinkOrCreateNewUser(String email, String registrationId, String providerUserId) {
        var user = userService.findUserByEmail(email)
                .orElseGet(() -> {
                    var request = SignUpRequest.builder()
                            .email(email)
                            .build();
                    var newUser = userService.createUser(request);
                    newUser.setEmailConfirmed(true);
                    return userRepository.save(newUser);
                });
        var identity = OauthIdentity.builder()
                .user(user)
                .provider(registrationId)
                .providerUserId(providerUserId)
                .email(email)
                .build();
        return oauthIdentityRepository.save(identity);
    }

    @Autowired
    public void setProviders(List<OAuth2Provider> providers) {
        this.providers = providers.stream()
                .collect(Collectors.toMap(OAuth2Provider::getProviderId, Function.identity()));
    }
}