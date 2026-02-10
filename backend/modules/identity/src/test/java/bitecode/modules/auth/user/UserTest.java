package bitecode.modules.auth.user;

import bitecode.modules._common.service.email.EmailService;
import bitecode.modules._common.utils.Paths;
import bitecode.modules.auth._config.AuthIntegrationTest;
import bitecode.modules.auth.auth.TOTPService;
import bitecode.modules.auth.auth.model.enums.MfaMethod;
import bitecode.modules.auth.user.model.entity.User;
import bitecode.modules.auth.user.model.request.SetMfaRequest;
import bitecode.modules.auth.user.model.request.SignUpRequest;
import io.restassured.http.ContentType;
import jakarta.mail.MessagingException;
import org.apache.http.client.utils.URLEncodedUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.*;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.*;

public class UserTest extends AuthIntegrationTest {

    @Captor
    ArgumentCaptor<Map<String, Object>> mapCaptor;

    @MockitoBean
    EmailService emailService;

    @MockitoSpyBean
    TOTPService totpService;

    @Autowired
    UserService userService;

    @Test
    @DisplayName("Registers new user and confirms email")
    void singUpTest() throws MessagingException, URISyntaxException {
        // 1. Register new user
        var req = SignUpRequest.builder()
                .email("testReg@email.com")
                .password("testpassword123").build();

        doNothing().when(emailService).sendEmail(any(), any(), any(), any());


        // @formatter:off
        given()
                .contentType(ContentType.JSON)
                .body(req)
        .when()
                .post(Paths.User.POST.signUp)
        .then()
                .statusCode(200)
                .body("email", equalTo("testReg@email.com"))
                .body("uuid", not(blankOrNullString()))
                .body("email_confirmed", is(false))
                .body("roles", contains("ROLE_USER"));
        // @formatter:on

        verify(emailService, atLeastOnce()).sendEmail(any(), any(), any(), mapCaptor.capture());

        var verificationLink = (String) mapCaptor.getValue().get("link");
        assertThat(verificationLink, is(not(blankOrNullString())));

        var params = URLEncodedUtils.parse(new URI(verificationLink), StandardCharsets.UTF_8);
        var verificationCode = params.stream().filter(nameValuePair -> "code".equals(nameValuePair.getName()))
                .findFirst()
                .get()
                .getValue();
        // 2. Confirm user email

        // @formatter:off
        given()
                .redirects().follow(false)
                .contentType(ContentType.JSON)
        .when()
                .post(Paths.User.POST.confirmEmail(verificationCode))
        .then()
                .statusCode(200);
        // @formatter:on

        var user = (User) userService.loadUserByUsername("testReg@email.com");
        assertThat(user.isEmailConfirmed(), is(true));
    }

    @Test
    @DisplayName("Should setup EMAIL MFA method")
    void shouldSetEmailMfaMethod() throws MessagingException {
        // 1. Set up new MFA method
        var testUserData = testDataFactory.createTestUser("shouldSetNewMfaMethod");
        var user = testUserData.user();
        var req = SetMfaRequest.builder().mfaMethod(MfaMethod.EMAIL).build();

        doNothing().when(emailService).sendEmail(any(), any(), any(), any());

        // pre-checks
        assertThat(user.isMfaEnabled(), is(false));
        assertThat(user.getMfaMethod(), nullValue());

        // @formatter:off
        given()
                .contentType(ContentType.JSON)
                .body(req)
                .auth().oauth2(testUserData.accessToken())
        .when()
                .put(Paths.User.PUT.mfa)
        .then()
                .statusCode(200)
                .body("mfa_method", equalTo("EMAIL"))
                .body("completed", is(true))
                .body("requires_confirmation", is(false))
                .body("qr_code_image_uri", is(nullValue()));
        // @formatter:on

        user = userService.findUserByUuid(user.getUuid()).get();

        assertThat(user.isMfaEnabled(), is(true));
        assertThat(user.getMfaMethod(), is(MfaMethod.EMAIL));
    }

    @Test
    @DisplayName("Should setup TOTP QR CODE MFA method")
    void shouldSetTOTPQRCODEMfaMethod() {
        // 1. Init QR_CODE MFA setup
        var testUserData = testDataFactory.createTestUser("shouldSetTOTPQRCODEMfaMethod");
        var user = testUserData.user();
        var initReq = SetMfaRequest.builder().mfaMethod(MfaMethod.QR_CODE).build();

        // pre-checks
        assertThat(user.isMfaEnabled(), is(false));
        assertThat(user.getMfaMethod(), nullValue());

        // @formatter:off
        given()
                .contentType(ContentType.JSON)
                .body(initReq)
                .auth().oauth2(testUserData.accessToken())
        .when()
                .put(Paths.User.PUT.mfa)
        .then()
                .statusCode(200)
                .body("mfa_method", equalTo("QR_CODE"))
                .body("completed", is(false))
                .body("requires_confirmation", is(true))
                .body("qr_code_image_uri", is(not(blankString())));
        // @formatter:on

        user = userService.findUserByUuid(user.getUuid()).get();

        assertThat(user.isMfaEnabled(), is(false));
        assertThat(user.getMfaMethod(), nullValue());

        // 2. Finish QR_CODE MFA setup
        var finishReq = SetMfaRequest.builder()
                .mfaMethod(MfaMethod.QR_CODE)
                .code("123456")
                .build();

        doReturn(true).when(totpService).verify(eq(user.getId()), any());

        // @formatter:off
        given()
                .contentType(ContentType.JSON)
                .body(finishReq)
                .auth().oauth2(testUserData.accessToken())
        .when()
                .put(Paths.User.PUT.mfa)
        .then()
                .statusCode(200)
                .body("mfa_method", equalTo("QR_CODE"))
                .body("completed", is(true))
                .body("requires_confirmation", nullValue())
                .body("qr_code_image_uri", nullValue());
        // @formatter:on

        verify(totpService, atLeastOnce()).verify(eq(user.getId()), any());

        user = userService.findUserByUuid(user.getUuid()).get();

        assertThat(user.isMfaEnabled(), is(true));
        assertThat(user.getMfaMethod(), is(MfaMethod.QR_CODE));
    }
}
