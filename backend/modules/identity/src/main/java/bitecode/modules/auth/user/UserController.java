package bitecode.modules.auth.user;

import bitecode.modules._common.model.annotation.AdminOrUserAccess;
import bitecode.modules._common.shared.identity.user.model.data.UserDataDetails;
import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import bitecode.modules._common.util.AuthUtils;
import bitecode.modules.auth.user.model.data.SetupMfaMethodDetails;
import bitecode.modules.auth.user.model.mapper.UserDataMapper;
import bitecode.modules.auth.user.model.mapper.UserMapper;
import bitecode.modules.auth.user.model.request.*;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import static bitecode.modules.auth.user.UserController.PATH_MAPPING;

@Slf4j
@RestController
@AdminOrUserAccess
@RequestMapping(PATH_MAPPING)
@RequiredArgsConstructor
public class UserController {
    public static final String PATH_MAPPING = "/users";

    private final UserService userService;
    private final UserMapper userMapper;
    private final UserDataMapper userDataMapper;

    @GetMapping("/self")
    public UserDetails getSelfUser() {
        var userId = AuthUtils.getUserId();
        if (!AuthUtils.getUserId().equals(userId)) {
            log.warn("Someone is playing with API, userId={},requestedUserId={}", AuthUtils.getUserId(), userId);
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST);
        }
        return userService.findUserByUuid(userId)
                .map(userMapper::toUserDetails)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
    }

    @PermitAll
    @PostMapping
    public UserDetails signUp(@Valid @RequestBody SignUpRequest request) {
        var user = userService.singUp(request);
        return userMapper.toUserDetails(user);
    }

    @PermitAll
    @PostMapping("/confirmations")
    public void resendVerificationEmail(@RequestBody @Valid ResendVerificationEmailRequest req) {
        userService.findUserByEmail(req.email())
                .ifPresentOrElse(userService::sendAccountVerificationEmail, () -> {
                    throw new HttpClientErrorException(HttpStatus.NOT_FOUND);
                });
    }

    @PermitAll
    @PostMapping("/confirmations/{verificationCode}")
    public void confirmEmail(@PathVariable String verificationCode) {
        userService.verifyUserEmail(verificationCode);
    }

    @PutMapping("/mfa")
    public SetupMfaMethodDetails setMfaMethod(@Valid @RequestBody SetMfaRequest request) {
        return userService.resolveMfaSetup(AuthUtils.getUserId(), request);
    }

    @GetMapping("/data")
    public UserDataDetails getUserData() {
        var userData = userService.findUserByUuidFetchUserData(AuthUtils.getUserId())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND)).getUserData();
        return userDataMapper.toUserDataDetails(userData);
    }

    @PatchMapping("/data")
    public UserDataDetails updateUserData(@Valid @RequestBody UpdateUserDataRequest request) {
        return userDataMapper.toUserDataDetails(userService.updateUserData(AuthUtils.getUserId(), request));
    }

    @PermitAll
    @PostMapping("/passwords/recovery/{username}")
    public void requestForgottenPasswordReset(@PathVariable String username) {
        userService.initForgottenPasswordReset(username);
    }

    @PermitAll
    @PostMapping("/passwords/recovery")
    public void resetForgottenPassword(@RequestBody ResetForgottenPasswordRequest request) {
        userService.resetForgottenPassword(request);
    }

    @PermitAll
    @PutMapping("/passwords")
    public void changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        userService.changePassword(AuthUtils.getUserId(), request.newPassword(), request.oldPassword());
    }
}
