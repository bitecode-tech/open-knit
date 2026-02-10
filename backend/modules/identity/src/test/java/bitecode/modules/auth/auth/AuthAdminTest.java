package bitecode.modules.auth.auth;

import bitecode.modules._common.utils.Paths;
import bitecode.modules._common.utils.TestDataFactory;
import bitecode.modules.auth._config.AuthIntegrationTest;
import bitecode.modules.auth.auth.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static io.restassured.RestAssured.given;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

public class AuthAdminTest extends AuthIntegrationTest {

    @Autowired
    RefreshTokenRepository refreshTokenRepository;

    TestDataFactory.TestUserData adminUserData;

    @BeforeAll
    void setup() {
        adminUserData = testDataFactory.createAdminUser();
    }

    @Test
    @DisplayName("Admin should revoke user refresh token")
    void shouldSignInNoMfaTest() {
        var user = testDataFactory.createTestUser("shouldSignInNoMfaTest").user();

        // @formatter:off
        given()
                .auth().oauth2(adminUserData.accessToken())
        .when()
                .delete(Paths.Auth.DELETE.adminRevokeToken(user.getUsername()))
        .then()
                .statusCode(200);
        // @formatter:on

        var revokedRefreshToken = refreshTokenRepository.findAll().stream()
                .filter(refreshToken -> refreshToken.getUsername().equals(user.getUsername())).findFirst().get();
        assertThat(revokedRefreshToken.isRevoked(), is(true));
    }

    @Test
    @DisplayName("User should not be able to revoke refresh token due to missing roles")
    void asUserShouldNotRevokeRefreshTokenDueToMissingRolesTest() {
        var userData = testDataFactory.createTestUser("asUserShouldNotRevokeRefreshTokenDueToMissingRolesTest");

        // @formatter:off
        given()
                .auth().oauth2(userData.accessToken())
        .when()
                .delete(Paths.Auth.DELETE.adminRevokeToken(userData.user().getUsername()))
        .then()
                .statusCode(403);
        // @formatter:on
    }
}
