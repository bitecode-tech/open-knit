package bitecode.modules.auth.user;

import bitecode.modules._common.service.cache.CacheRef;
import bitecode.modules._common.service.cache.CacheService;
import bitecode.modules._common.service.email.EmailService;
import bitecode.modules._common.util.RandomCodeGeneratorUtils;
import bitecode.modules.auth.auth.AuthService;
import bitecode.modules.auth.auth.TOTPService;
import bitecode.modules.auth.auth.config.properties.AuthProperties;
import bitecode.modules.auth.auth.model.enums.MfaMethod;
import bitecode.modules.auth.auth.util.PasswordUtils;
import bitecode.modules.auth.user.model.data.SetupMfaMethodDetails;
import bitecode.modules.auth.user.model.entity.User;
import bitecode.modules.auth.user.model.entity.UserData;
import bitecode.modules.auth.user.model.entity.UserRole;
import bitecode.modules.auth.user.model.mapper.UserDataMapper;
import bitecode.modules.auth.user.model.mapper.UserMapper;
import bitecode.modules.auth.user.model.request.ResetForgottenPasswordRequest;
import bitecode.modules.auth.user.model.request.SetMfaRequest;
import bitecode.modules.auth.user.model.request.SignUpRequest;
import bitecode.modules.auth.user.model.request.UpdateUserDataRequest;
import bitecode.modules.auth.user.repository.UserRepository;
import dev.samstevens.totp.exceptions.QrGenerationException;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.ConfigurableBeanFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.concurrent.TimeUnit;

import static bitecode.modules.auth.auth.util.PasswordUtils.hashPassword;

@Service
@Slf4j
@RequiredArgsConstructor
@Scope(value = ConfigurableBeanFactory.SCOPE_SINGLETON, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class UserService implements UserDetailsService {

    private CacheRef<String, ForgottenPasswordData> FORGOTTEN_EMAIL_CODES_CACHE;
    private CacheRef<String, String> NEW_ACCOUNTS_EMAIL_VERIFICATION_CACHE;
    private CacheRef<String, Integer> EMAIL_VERIFICATION_RATE_LIMITER;

    @Autowired
    private final UserRepository userRepository;
    @Autowired
    private final UserMapper userMapper;
    @Autowired
    private final UserDataMapper userDataMapper;
    @Autowired
    private final AuthService authService;
    @Autowired
    private final AuthProperties authProperties;
    @Autowired
    private final EmailService emailService;
    @Autowired
    private final TOTPService totpService;

    public Optional<User> findUserByUuid(UUID userId) {
        return userRepository.findByUuid(userId);
    }

    public List<User> findAllByUuidInWithDetails(List<UUID> userIds) {
        return userRepository.findAllByUuidInWithUserData(userIds);
    }

    public Page<User> findUsersWithRolesAndDetails(Pageable pageable) {
        return userRepository.findAllWithRolesAndDetails(pageable);
    }

    @Transactional
    public Optional<User> findUserByUuidFetchUserData(UUID userId) {
        return userRepository.findByUuidWithUserData(userId);
    }

    public Optional<User> findUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findUserByIdFetchRoles(Long id) {
        return userRepository.findById(id);
    }

    public Page<UUID> findAllRegisteredUsers(Pageable pageable) {
        return userRepository.findAllByEmailConfirmed(pageable, true);
    }

    @Transactional
    public User singUp(SignUpRequest request) {
        var userOp = userRepository.findByEmail(request.email());
        if (userOp.isPresent()) {
            var user = userOp.get();
            sendAccountVerificationEmail(user);
            return user;
        }
        var user = createUser(request);
        sendAccountVerificationEmail(user);
        return user;
    }

    public User createUser(SignUpRequest request) {
        var user = userMapper.toUser(request);
        if (request.password() != null) {
            user.setPassword(hashPassword(request.password()));
        }
        var defaultRole = authService.findRoleByName("ROLE_USER").get();
        var userRole = UserRole.builder().role(defaultRole).user(user).build();
        user.setRoles(new HashSet<>(Set.of(userRole)));
        var userData = UserData.builder().user(user).build();
        user.setUserData(userData);
        return userRepository.save(user);
    }

    public void sendAccountVerificationEmail(User user) {
        sendAccountVerificationEmail(user, null);
    }

    public void sendAccountVerificationEmail(User user, @Nullable String tempPwd) {
        if (user.isEmailConfirmed()) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT, "User already exists");
        }
        if (EMAIL_VERIFICATION_RATE_LIMITER.get(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Please wait 30 seconds before retrying.");
        }
        var verificationCode = RandomCodeGeneratorUtils.generateCode(6);
        sendNewAccountConfirmationEmail(user.getEmail(), verificationCode, tempPwd);
    }

    public void verifyUserEmail(String verificationCode) {
        var email = NEW_ACCOUNTS_EMAIL_VERIFICATION_CACHE.getAndRemove(verificationCode)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Invalid verification code"));
        userRepository.updateEmailConfirmedByEmail(email);
    }

    @Transactional
    public SetupMfaMethodDetails resolveMfaSetup(UUID userId, SetMfaRequest request) {
        var user = findUserByUuid(userId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "User not found"));

        var setupMfaMethodDetails = resolveMfa(request, user);

        if (setupMfaMethodDetails.completed()) {
            if (MfaMethod.DISABLE.equals(setupMfaMethodDetails.mfaMethod())) {
                user.setMfaEnabled(false);
                user.setMfaMethod(null);
            } else {
                user.setMfaEnabled(true);
                user.setMfaMethod(setupMfaMethodDetails.mfaMethod());
            }
        }
        return setupMfaMethodDetails;
    }

    @Transactional
    public User changePassword(UUID userId, String newPwd, String oldPwd) {
        var user = findUserByUuid(userId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));

        if (user.getPassword() != null && !PasswordUtils.checkPassword(oldPwd, user.getPassword())) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Passwords do not match");
        }
        user.setPassword(hashPassword(newPwd));
        return user;
    }

    public void initForgottenPasswordReset(String email) {
        try {
            var user = findUserByEmail(email)
                    .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
            var verificationCode = UUID.randomUUID().toString().replace("-", "");
            FORGOTTEN_EMAIL_CODES_CACHE.put(verificationCode, new ForgottenPasswordData(verificationCode, user.getUsername()));
            if (log.isDebugEnabled()) {
                log.debug("Forgotten password req, username=%s, verificationCode=%s".formatted(user.getUsername(), verificationCode));
            }

            var appProps = authProperties.getApp();
            var frontendUrl = appProps.getFrontendUrl();
            var forgottenPasswordLinkUrlPath = appProps.getUser().getPasswordReset().getForgottenPasswordLinkUrlPath();

            var link = frontendUrl + forgottenPasswordLinkUrlPath + "?verificationCode=" + verificationCode;

            var params = Map.<String, Object>of(
                    "link", link,
                    "username", user.getUsername()
            );
            emailService.sendEmail(email, "Reset password request", "forgotten_password_template.html", params);
        } catch (MessagingException e) {
            log.error("Forgotten password req, could not send email", e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public UserData updateUserData(UUID userId, UpdateUserDataRequest request) {
        var user = findUserByUuidFetchUserData(userId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
        userDataMapper.patchUserFromRequest(request, user.getUserData());
        return user.getUserData();
    }

    public void resetForgottenPassword(ResetForgottenPasswordRequest request) {
        var verificationCode = request.verificationCode();
        var forgottenPasswordData = FORGOTTEN_EMAIL_CODES_CACHE.get(verificationCode)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
        if (forgottenPasswordData.verificationCode().equals(verificationCode)) {
            FORGOTTEN_EMAIL_CODES_CACHE.remove(verificationCode);
            userRepository.updatePasswordByEmail(forgottenPasswordData.username(), hashPassword(request.newPassword()));
        } else {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Invalid verification code");
        }
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findUserByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private void sendNewAccountConfirmationEmail(String email, String verificationCode, @Nullable String tempPwd) {
        EMAIL_VERIFICATION_RATE_LIMITER.put(email, Integer.MAX_VALUE);
        var model = new HashMap<String, Object>();
        var frontendUrl = authProperties.getApp().getFrontendUrl();
        var emailUrlPath = authProperties.getApp().getUser().getConfirmEmailUrlPath();

        var link = frontendUrl + emailUrlPath + "?code=" + verificationCode + "&email=" + email;
        log.debug("Verification email={} link:{}, tempPwd={}", email, link, tempPwd);

        model.put("username", email);
        model.put("link", link);
        model.put("code", verificationCode);
        model.put("tempPwd", tempPwd);

        try {
            emailService.sendEmail(email, "Email confirmation", "new_user_template.html", model);
            NEW_ACCOUNTS_EMAIL_VERIFICATION_CACHE.put(verificationCode, email);
        } catch (MessagingException e) {
            log.error("Could not send email", e);
            throw new HttpClientErrorException(HttpStatus.SERVICE_UNAVAILABLE, "Could not send new account confirmation email");
        }
    }

    private SetupMfaMethodDetails resolveMfa(SetMfaRequest request, User user) {
        var mfaMethod = request.mfaMethod();
        var setupMfaBuilder = SetupMfaMethodDetails.builder().mfaMethod(mfaMethod);
        SetupMfaMethodDetails setupMfaMethodDetails;
        if (MfaMethod.DISABLE.equals(mfaMethod)) {
            return setupMfaBuilder.completed(true).requiresConfirmation(false).build();
        } else if (request.code() != null) {
            setupMfaMethodDetails = finishMfaSetup(user, request, mfaMethod, setupMfaBuilder);
        } else {
            setupMfaMethodDetails = initMfaSetup(mfaMethod, user, setupMfaBuilder);
        }
        return setupMfaMethodDetails;
    }

    private SetupMfaMethodDetails finishMfaSetup(User user, SetMfaRequest request, MfaMethod mfaMethod, SetupMfaMethodDetails.SetupMfaMethodDetailsBuilder setupMfaBuilder) {
        switch (mfaMethod) {
            case EMAIL -> {
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Not required");
            }
            case QR_CODE -> {
                var codeValid = totpService.verify(user.getId(), request.code());
                if (!codeValid) {
                    throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Invalid verification code");
                }
                return setupMfaBuilder.completed(true).build();
            }
            default -> throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Invalid MFA method");
        }
    }

    private SetupMfaMethodDetails initMfaSetup(MfaMethod mfaMethod, User user, SetupMfaMethodDetails.SetupMfaMethodDetailsBuilder setupMfaBuilder) {
        switch (mfaMethod) {
            case EMAIL -> {
                if (!user.isEmailConfirmed()) {
                    throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "User email not confirmed yet");
                }
                return setupMfaBuilder.completed(true).requiresConfirmation(false).build();
            }
            case QR_CODE -> {
                try {
                    return setupMfaBuilder.completed(false)
                            .requiresConfirmation(true)
                            .qrCodeImageUri(totpService.setupDevice(user))
                            .build();
                } catch (QrGenerationException e) {
                    throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Qr generation failed");
                }
            }
            default -> throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Invalid MFA method");
        }
    }

    @Autowired
    public void setCache(CacheService cacheService) {
        this.FORGOTTEN_EMAIL_CODES_CACHE = cacheService.createCache("FORGOTTEN_EMAIL_CODES_CACHE", 15, TimeUnit.MINUTES);
        this.NEW_ACCOUNTS_EMAIL_VERIFICATION_CACHE = cacheService.createCache("NEW_ACCOUNTS_EMAIL_VERIFICATION_CACHE", 1, TimeUnit.HOURS);
        this.EMAIL_VERIFICATION_RATE_LIMITER = cacheService.createCache("EMAIL_VERIFICATION_RATE_LIMITER", 10, TimeUnit.SECONDS);
    }

    record ForgottenPasswordData(String verificationCode, String username) {

    }
}
