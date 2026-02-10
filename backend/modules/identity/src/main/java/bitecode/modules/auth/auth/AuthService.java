package bitecode.modules.auth.auth;

import bitecode.modules._common.service.cache.CacheRef;
import bitecode.modules._common.service.cache.CacheService;
import bitecode.modules._common.service.email.EmailService;
import bitecode.modules._common.util.RandomCodeGeneratorUtils;
import bitecode.modules.auth.auth.model.data.AuthenticatedUserDetails;
import bitecode.modules.auth.auth.model.entity.Role;
import bitecode.modules.auth.auth.model.request.SignInRequest;
import bitecode.modules.auth.auth.repository.RoleRepository;
import bitecode.modules.auth.user.UserService;
import bitecode.modules.auth.user.model.entity.User;
import bitecode.modules.auth.user.model.mapper.UserMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.HashMap;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class AuthService {
    private final CacheRef<String, Integer> MFA_VERIFICATION_CODES;
    private final RoleRepository roleRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserMapper userMapper;
    private final EmailService emailService;
    private final TOTPService totpService;

    public AuthService(RoleRepository roleRepository, AuthenticationManager authenticationManager, JwtService jwtService,
                       UserService userService, UserMapper userMapper, CacheService cacheService, EmailService emailService, TOTPService totpService) {
        this.roleRepository = roleRepository;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userService = userService;
        this.userMapper = userMapper;
        this.MFA_VERIFICATION_CODES = cacheService.createCache("MFA_VERIFICATION_CODES", 15, TimeUnit.MINUTES);
        this.emailService = emailService;
        this.totpService = totpService;
    }

    @Transactional
    public AuthenticatedUserDetails createRefreshToken(SignInRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        var user = userService.findUserByEmail(request.username())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        var authUserBuilder = AuthenticatedUserDetails.builder()
                .mfaMethod(user.getMfaMethod());

        if (!user.isEmailConfirmed()) {
            userService.sendAccountVerificationEmail(user);
            return authUserBuilder.emailVerificationRequired(true).build();
        }

        if (user.isMfaEnabled()) {
            if (request.mfaCode() != null) {
                validateMfaCode(request, user);
            } else {
                requestMfaVerification(user);
                return authUserBuilder.mfaRequired(true).build();
            }
        }

        return authUserBuilder
                .refreshToken(jwtService.generateRefreshToken(user, !request.rememberDevice()))
                .accessToken(jwtService.generateAccessToken(user))
                .user(userMapper.toUserDetails(user))
                .build();
    }

    public AuthenticatedUserDetails generateAccessToken(UUID refreshTokenId) {
        var refreshToken = jwtService.validateRefreshToken(refreshTokenId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.UNAUTHORIZED));

        var user = userService.findUserByIdFetchRoles(refreshToken.getUserId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR));

        return AuthenticatedUserDetails.builder()
                .user(userMapper.toUserDetails(user))
                .accessToken(jwtService.generateAccessToken(user))
                .build();
    }

    private void validateMfaCode(SignInRequest request, User user) {
        assert request.mfaCode() != null;
        switch (user.getMfaMethod()) {
            case EMAIL -> {
                MFA_VERIFICATION_CODES.get(user.getUsername())
                        .filter(verificationCode -> verificationCode.equals(Integer.valueOf(request.mfaCode())))
                        .orElseThrow(() -> new HttpClientErrorException(HttpStatus.UNAUTHORIZED));
                MFA_VERIFICATION_CODES.remove(user.getUsername());
            }
            case QR_CODE -> {
                if (!totpService.verify(user.getId(), request.mfaCode())) {
                    throw new HttpClientErrorException(HttpStatus.UNAUTHORIZED);
                }
            }
            default -> throw new IllegalStateException("Unexpected value: " + user.getMfaMethod());
        }
    }

    private void requestMfaVerification(User user) {
        var pinCode = RandomCodeGeneratorUtils.generatePin(6);
        try {
            switch (user.getMfaMethod()) {
                case EMAIL -> {
                    var model = new HashMap<String, Object>();
                    model.put("username", user.getUsername());
                    model.put("code", pinCode);
                    MFA_VERIFICATION_CODES.put(user.getUsername(), pinCode);
                    log.debug("Requested EMAIL MFA code, user={},code={}", user.getUsername(), pinCode);
                    emailService.sendEmail(user.getEmail(), "Requested MFA code", "mfa_check_template.html", model);
                }
                case QR_CODE -> {
                }
                default -> throw new UnsupportedOperationException("Unsupported MFA Method");
            }
        } catch (Exception e) {
            log.error("Error requesting MFA code", e);
            throw new HttpClientErrorException(HttpStatus.SERVICE_UNAVAILABLE, "Try again later...");
        }
    }

    public Optional<Role> findRoleByName(String name) {
        return roleRepository.findByName(name);
    }
}
