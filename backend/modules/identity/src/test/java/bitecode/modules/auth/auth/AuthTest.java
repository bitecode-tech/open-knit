package bitecode.modules.auth.auth;

import bitecode.modules._common.service.email.EmailService;
import bitecode.modules._common.utils.Paths;
import bitecode.modules.auth._config.AuthIntegrationTest;
import bitecode.modules.auth.auth.model.data.AuthenticatedUserDetails;
import bitecode.modules.auth.auth.model.entity.RefreshToken;
import bitecode.modules.auth.auth.model.enums.MfaMethod;
import bitecode.modules.auth.auth.model.request.SignInRequest;
import bitecode.modules.auth.auth.model.response.SignInResponse;
import bitecode.modules.auth.auth.repository.RefreshTokenRepository;
import bitecode.modules.auth.user.model.entity.User;
import io.restassured.http.ContentType;
import io.restassured.http.Cookie;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.util.Map;
import java.util.UUID;

import static bitecode.modules._common.utils.TestDataFactory.TEST_USER_HASHED_PASSWORD;
import static bitecode.modules._common.utils.TestDataFactory.TEST_USER_PASSWORD;
import static io.restassured.RestAssured.given;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class AuthTest extends AuthIntegrationTest {

    @Autowired
    JwtService jwtService;

    @Autowired
    RefreshTokenRepository refreshTokenRepository;

    @MockitoBean
    EmailService emailService;

    @Captor
    ArgumentCaptor<Map<String, Object>> mapCaptor;

    User user;
    RefreshToken refreshToken;

    @BeforeAll
    void setup() {
        var testUserData = testDataFactory.createTestUser("AuthTest");
        user = testUserData.user();
        refreshToken = testUserData.refreshToken();
    }

    @Test
    @DisplayName("Should login user without MFA")
    void shouldSignInNoMfa() {
        var req = SignInRequest.builder()
                .username(user.getUsername())
                .password(TEST_USER_PASSWORD)
                .build();
        // @formatter:off
        var resp = given()
                .contentType(ContentType.JSON)
                .body(req)
        .when()
                .post(Paths.Auth.POST.signIn)
        .then()
                .statusCode(200)
                .body("user", notNullValue())
                .body("mfa_required", nullValue())
                .body("access_token", not(blankOrNullString()))
                .cookie("refreshTokenId", notNullValue())
                .extract().response();
        // @formatter:on
        var cookie = resp.cookie(AuthController.REFRESH_TOKEN_COOKIE_NAME);
        var signInResp = resp.body().as(SignInResponse.class);

        assertThat(jwtService.validateToken(signInResp.accessToken(), user), is(true));
        assertThat(jwtService.validateRefreshToken(UUID.fromString(cookie)).isPresent(), is(true));
        assertThat(refreshTokenRepository.findByUuid(UUID.fromString(cookie)).isPresent(), is(true));
    }

    @Test
    @DisplayName("Should login user with MFA (EMAIL)")
    void shouldSignInWithMfaEmail() throws MessagingException {
        var inOrder = inOrder(emailService);

        // user with already enabled EMAIL mfa method
        var mfaTestUser = testDataFactory.createCustomTestUser(User.builder()
                .email("shouldSignInWithMfaEmail@example.com")
                .mfaEnabled(true)
                .mfaMethod(MfaMethod.EMAIL)
                .emailConfirmed(true)
                .password(TEST_USER_HASHED_PASSWORD)
                .build(), false).user();

        // 1. Try to login - should result in sent MFA code
        var reqWithoutMfaCode = SignInRequest.builder()
                .username(mfaTestUser.getUsername())
                .password(TEST_USER_PASSWORD)
                .build();

        doNothing().when(emailService).sendEmail(any(), any(), any(), any());

        // @formatter:off
        given()
                .contentType(ContentType.JSON)
                .body(reqWithoutMfaCode)
        .when()
                .post(Paths.Auth.POST.signIn)
        .then()
                .statusCode(200)
                .body("user", nullValue())
                .body("email_verification_required", nullValue())
                .body("mfa_required", is(true))
                .body("mfa_method", is(MfaMethod.EMAIL.toString()))
                .body("refresh_token", nullValue())
                .body("access_token", nullValue())
                .cookies(Map.of());
        // @formatter:on

        inOrder.verify(emailService, calls(1)).sendEmail(any(), any(), any(), mapCaptor.capture());

        // 2. login providing mfa pin code
        var mfaCode = (int) mapCaptor.getValue().get("code");
        var reqWithMfaCode = SignInRequest.builder()
                .username(mfaTestUser.getUsername())
                .password(TEST_USER_PASSWORD)
                .mfaCode(String.valueOf(mfaCode))
                .build();

        // @formatter:off
        var resp = given()
                .contentType(ContentType.JSON)
                .body(reqWithMfaCode)
        .when()
                .post(Paths.Auth.POST.signIn)
        .then()
                .statusCode(200)
                .body("user", notNullValue())
                .body("mfa_required", nullValue())
                .body("mfa_method", is(MfaMethod.EMAIL.toString()))
                .body("email_verification_required", nullValue())
                .body("access_token", not(blankOrNullString()))
                .cookie("refreshTokenId", notNullValue())
                .extract().response();
        // @formatter:on
        var cookie = resp.cookie(AuthController.REFRESH_TOKEN_COOKIE_NAME);
        var signInResp = resp.body().as(SignInResponse.class);

        inOrder.verify(emailService, never()).sendEmail(any(), any(), any(), any());

        assertThat(jwtService.validateToken(signInResp.accessToken(), mfaTestUser), is(true));
        assertThat(jwtService.validateRefreshToken(UUID.fromString(cookie)).isPresent(), is(true));
        assertThat(refreshTokenRepository.findByUuid(UUID.fromString(cookie)).isPresent(), is(true));
    }

    @Test
    @DisplayName("Should not let user login due to wrong password")
    void shouldNotSignIdDueToWrongPassword() {
        var req = SignInRequest.builder()
                .username(user.getUsername())
                .password("dsadsadsadsa")
                .build();
        // @formatter:off
        given()
                .contentType(ContentType.JSON)
                .body(req)
        .when()
                .post(Paths.Auth.POST.signIn)
        .then()
                .statusCode(401);
        // @formatter:on
    }


    @Test
    @DisplayName("Should create new access token")
    void shouldGenerateNewAccessToken() {
        var req = SignInRequest.builder()
                .username(user.getUsername())
                .password(TEST_USER_PASSWORD)
                .build();

        // @formatter:off
        var authUserDetails = given()
                .contentType(ContentType.JSON)
                .body(req)
                .cookie(new Cookie.Builder(AuthController.REFRESH_TOKEN_COOKIE_NAME, refreshToken.getUuid().toString()).build())
        .when()
                .post(Paths.Auth.POST.refreshToken)
        .then()
                .statusCode(200)
                .body("user", notNullValue())
                .body("refresh_token", nullValue())
                .body("access_token", notNullValue())
                .cookies(Map.of())
                .extract().body().as(AuthenticatedUserDetails.class);
        // @formatter:on

        assertThat(jwtService.validateToken(authUserDetails.accessToken(), user), is(true));
    }


    @Test
    @DisplayName("Should not create new access token due to wrong id")
    void shouldNotGenerateNewAccessTokenDueToWrongId() {
        // @formatter:off
        given()
                .contentType(ContentType.JSON)
                .cookie(new Cookie.Builder(AuthController.REFRESH_TOKEN_COOKIE_NAME, "wrong ID").build())
        .when()
                .post(Paths.Auth.POST.refreshToken)
        .then()
                .statusCode(404);
        // @formatter:on
    }
}
