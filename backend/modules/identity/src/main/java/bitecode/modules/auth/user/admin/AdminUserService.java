package bitecode.modules.auth.user.admin;

import bitecode.modules._common.service.email.EmailService;
import bitecode.modules._common.util.RandomCodeGeneratorUtils;
import bitecode.modules.auth.auth.config.properties.AuthProperties;
import bitecode.modules.auth.auth.repository.RoleRepository;
import bitecode.modules.auth.user.UserService;
import bitecode.modules.auth.user.admin.model.request.InviteUserRequest;
import bitecode.modules.auth.user.model.data.FindUsersCriteria;
import bitecode.modules.auth.user.model.entity.User;
import bitecode.modules.auth.user.model.entity.UserData;
import bitecode.modules.auth.user.model.entity.UserRole;
import bitecode.modules.auth.user.repository.UserRepository;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Map;
import java.util.Set;

import static bitecode.modules.auth.auth.util.PasswordUtils.hashPassword;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {
    private final EmailService emailService;
    private final AuthProperties authProperties;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserService userService;

    public Page<User> findByCriteria(Pageable pageable, FindUsersCriteria criteria) {
        return userRepository.findAllByCriteria(pageable, criteria);
    }

    @Transactional
    public Map<String, Long> getFiltersTotalElemsCount() {
        return Map.of("ALL", userRepository.count(),
                "REGISTRATION_COMPLETED", userRepository.countByEmailConfirmedIs(true),
                "REGISTRATION_INCOMPLETE", userRepository.countByEmailConfirmedIs(false)
        );
    }

    public void sendInvitationEmail(String email) {
        var appProps = authProperties.getApp();
        var userInviteUrlPath = appProps.getUser().getUserInviteUrlPath();
        var frontendUrl = appProps.getFrontendUrl();
        var userInviteUrl = frontendUrl + userInviteUrlPath;

        var params = Map.of("username", email, "link", userInviteUrl);
        try {
            emailService.sendEmail(email, "Bitecode app invitation", "invite_new_user_template.html", params);
        } catch (MessagingException e) {
            log.error("Could not send app invitation email", e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public User createAndInviteUser(InviteUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT);
        }
        var tempPwd = RandomCodeGeneratorUtils.generateCode(8);
        var role = roleRepository.findByName(request.role().toUpperCase())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Role=%s not found".formatted(request.role().toUpperCase())));

        var userData = UserData.builder()
                .name(request.firstName())
                .surname(request.lastName())
                .build();

        var userRole = UserRole.builder().role(role).build();

        var user = User.builder()
                .email(request.email())
                .password(hashPassword(tempPwd))
                .userData(userData)
                .roles(Set.of(userRole))
                .build();

        userData.setUser(user);
        userRole.setUser(user);

        user = userRepository.save(user);
        userService.sendAccountVerificationEmail(user, tempPwd);
        return user;
    }
}
