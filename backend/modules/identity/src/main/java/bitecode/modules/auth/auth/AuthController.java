package bitecode.modules.auth.auth;

import bitecode.modules._common.model.annotation.AdminOrUserAccess;
import bitecode.modules._common.model.enums.EnvProfile;
import bitecode.modules.auth.auth.model.entity.RefreshToken;
import bitecode.modules.auth.auth.model.mapper.AuthenticatedUserMapper;
import bitecode.modules.auth.auth.model.request.SignInRequest;
import bitecode.modules.auth.auth.model.response.RefreshTokenResponse;
import bitecode.modules.auth.auth.model.response.SignInResponse;
import jakarta.annotation.security.PermitAll;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@RestController
@AdminOrUserAccess
@RequestMapping(AuthController.PATH_MAPPING)
@RequiredArgsConstructor
public class AuthController {
    @Value("${spring.profiles.active:}")
    private EnvProfile activeProfile;

    public final static String REFRESH_TOKEN_COOKIE_NAME = "refreshTokenId";
    public final static String PATH_MAPPING = "/oauth";
    private final AuthService authService;
    private final AuthenticatedUserMapper mapper;

    @PermitAll
    @PostMapping("/login")
    public SignInResponse login(@Valid @RequestBody SignInRequest request, HttpServletResponse response) {
        var authUserDetails = authService.createRefreshToken(request);
        if (authUserDetails.refreshToken() != null) {
            response.addCookie(createRefreshTokenCookie(authUserDetails.refreshToken(), activeProfile));
        }
        return mapper.toSignInResponse(authUserDetails);
    }

    @PermitAll
    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, "");
        cookie.setPath("/");
        cookie.setMaxAge(0);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        response.addCookie(cookie);
    }

    @PermitAll
    @PostMapping("/tokens/access")
    public RefreshTokenResponse refreshAccessToken(@CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken) {
        if (refreshToken != null) {
            return mapper.toRefreshTokenResponse(authService.generateAccessToken(UUID.fromString(refreshToken)));
        }
        throw new HttpClientErrorException(HttpStatus.NOT_FOUND);
    }

    public static Cookie createRefreshTokenCookie(RefreshToken refreshToken, EnvProfile activeProfile) {
        var cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken.getUuid().toString());
        cookie.setHttpOnly(true);
        cookie.setSecure(EnvProfile.LOCAL != activeProfile);
        cookie.setPath("/");
        cookie.setAttribute("SameSite", "Lax");
        cookie.setMaxAge(((int) Duration.between(Instant.now(), refreshToken.getExpirationTime()).getSeconds()));
        return cookie;
    }
}
