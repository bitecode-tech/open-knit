package bitecode.modules._common;

import bitecode.modules._common.config.IntegrationTestConfig;
import bitecode.modules._common.model.event.ModuleEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import io.restassured.RestAssured;
import io.restassured.config.ObjectMapperConfig;
import io.restassured.config.RestAssuredConfig;
import io.restassured.mapper.ObjectMapperType;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

@Slf4j
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = {TestApplication.class, IntegrationTestConfig.class})
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "bitecode.security.jwt.secret-key=dsadsad1231324dsadsad1231324dsadsad1231324dsadsad1231324dsadsad1231324dsadsad1231324",
        "bitecode.security.jwt.access-token-expiration=900000",
        "bitecode.security.jwt.refresh-token-expiration=604800000",
        "bitecode.security.jwt.short-refresh-token-expiration=60000",
        "bitecode.security.no-auth-urls.GET[0]=/oauth2/authorization/**",
        "bitecode.security.no-auth-urls.GET[1]=/login/oauth2/code/**",
        "bitecode.security.no-auth-urls.POST[0]=/api/users",
        "bitecode.security.no-auth-urls.POST[1]=/api/users/passwords/recovery/**",
        "bitecode.security.no-auth-urls.POST[2]=/api/users/confirmations/**",
        "bitecode.security.no-auth-urls.POST[3]=/api/oauth/login",
        "bitecode.security.no-auth-urls.POST[4]=/api/oauth/logout",
        "bitecode.security.no-auth-urls.POST[5]=/api/oauth/tokens/access",
        "bitecode.security.no-auth-urls.OPTIONS[0]=/oauth2/authorization/**",
        "bitecode.security.no-auth-urls.OPTIONS[1]=/login/oauth2/code/**",
        "spring.security.oauth2.client.registration.google.client-id=test-client-id",
        "spring.security.oauth2.client.registration.google.client-secret=test-client-secret",
        "spring.security.oauth2.client.registration.google.redirect-uri=http://localhost:8080/login/oauth2/code/google",
        "spring.security.oauth2.client.registration.google.scope=openid,email,profile",
        "spring.security.oauth2.client.provider.google.authorization-uri=https://accounts.google.com/o/oauth2/v2/auth",
        "spring.security.oauth2.client.provider.google.token-uri=https://oauth2.googleapis.com/token",
        "spring.security.oauth2.client.provider.google.user-info-uri=https://openidconnect.googleapis.com/v1/userinfo",
        "spring.security.oauth2.client.provider.google.user-name-attribute=sub",
        "totp.secret.length=128",
        "totp.secret.key=test-key",
        "totp.code.length=8",
        "totp.time.period=30",
        "totp.time.discrepancy=2",
        "totp.issuer=bitecode.test"
})
@TestInstance(Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
public class BaseIntegrationTest {

    @Autowired
    protected TestEventCollector<ModuleEvent> allEventsCollector;

    //@Container - do not use, it makes container to die after each test
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.1");

    @LocalServerPort
    private int port;

    @Autowired
    protected ObjectMapper objectMapper;

    static {
        System.setProperty("api.version", System.getProperty("api.version", "1.40"));
        postgres.start();

        RestAssured.config = RestAssuredConfig.config().objectMapperConfig(new ObjectMapperConfig()
                .defaultObjectMapperType(ObjectMapperType.JACKSON_2)
                .jackson2ObjectMapperFactory(
                (cls, charset) -> {
                    ObjectMapper om = new ObjectMapper().findAndRegisterModules();
                    om.setPropertyNamingStrategy(PropertyNamingStrategies.SNAKE_CASE);
                    return om;
                }
        ));
    }

    @BeforeAll
    public void beforeAll() {
        RestAssured.port = this.port;
        logDbInfo();
    }

    @AfterEach
    public void afterEach() {
        allEventsCollector.lock();
    }

    @BeforeEach
    public void beforeEach() {
        allEventsCollector.clear();
        allEventsCollector.unlock();
    }

    private static void logDbInfo() {
        log.info("🚀 Testcontainers PostgreSQL Info:");
        log.info("🔹 JDBC URL: {}", postgres.getJdbcUrl());
        log.info("🔹 Host: {}", postgres.getHost());
        log.info("🔹 Port: {}", postgres.getMappedPort(5432));
        log.info("🔹 Database Name: {}", postgres.getDatabaseName());
        log.info("🔹 Username: {}", postgres.getUsername());
        log.info("🔹 Password: {}", postgres.getPassword());
    }
}
