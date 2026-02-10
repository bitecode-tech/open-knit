package bitecode.modules._common.utils;

import bitecode.modules.auth.auth.JwtService;
import bitecode.modules.auth.auth.model.entity.RefreshToken;
import bitecode.modules.auth.auth.repository.RoleRepository;
import bitecode.modules.auth.user.model.entity.User;
import bitecode.modules.auth.user.model.entity.UserRole;
import bitecode.modules.auth.user.repository.UserRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class TestDataFactory {
    public static final String TEST_USER_PASSWORD = "test123";
    public static final String TEST_ADMIN_PASSWORD = "admin123";
    public static final String TEST_USER_HASHED_PASSWORD = "$2a$12$0fNCTu93qhEAv3zRYabxgOJOVKcBjgepK8jcvXUJTYXC8D/h7gGe.";
    public static final String TEST_ADMIN_HASHED_PASSWORD = "$2a$12$/TtQ/pnczS9f7rNbszoe9O5SnHswPlqiCVvqBN.C3yZyrWE3tG7Ty";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public TestUserData createTestUser(String namePrefix) {
        var user = User.builder()
                .email(namePrefix + "test@test.com")
                .password("$2a$12$0fNCTu93qhEAv3zRYabxgOJOVKcBjgepK8jcvXUJTYXC8D/h7gGe.")
                .emailConfirmed(true)
                .build();
        var defaultRole = roleRepository.findByName("ROLE_USER").get();
        var userRole = UserRole.builder().role(defaultRole).user(user).build();
        user.setRoles(Set.of(userRole));
        user = userRepository.save(user);
        var refreshToken = jwtService.generateRefreshToken(user, false);
        var accessToken = jwtService.generateAccessToken(user);
        return new TestUserData(user, refreshToken, accessToken);
    }

    public TestUserData createAdminUser() {
        var user = User.builder()
                .email("admin@admin.com")
                .password(TEST_ADMIN_HASHED_PASSWORD)
                .emailConfirmed(true)
                .build();
        var defaultRole = roleRepository.findByName("ROLE_ADMIN").get();
        var userRole = UserRole.builder().role(defaultRole).user(user).build();
        user.setRoles(Set.of(userRole));
        user = userRepository.save(user);
        return new TestUserData(user, jwtService.generateRefreshToken(user, false), jwtService.generateAccessToken(user));
    }

    public TestUserData createCustomTestUser(User user, boolean generateTokens) {
        var defaultRole = roleRepository.findByName("ROLE_USER").get();
        var userRole = UserRole.builder().role(defaultRole).user(user).build();
        user.setRoles(Set.of(userRole));
        user = userRepository.save(user);
        var dataBuilder = TestUserData.builder().user(user);
        if (generateTokens) {
            dataBuilder.refreshToken(jwtService.generateRefreshToken(user, false));
            dataBuilder.accessToken(jwtService.generateAccessToken(user));
        }
        return dataBuilder.build();
    }

    @Builder
    public record TestUserData(
            User user,
            RefreshToken refreshToken,
            String accessToken
    ) {
    }
}
