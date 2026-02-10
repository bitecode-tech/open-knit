package bitecode.modules._common;

import bitecode.modules._common.config.IntegrationTestConfig;
import bitecode.modules._common.model.event.ModuleEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import io.restassured.RestAssured;
import io.restassured.config.ObjectMapperConfig;
import io.restassured.config.RestAssuredConfig;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

@Slf4j
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = {TestApplication.class, IntegrationTestConfig.class})
@ActiveProfiles("test")
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
        postgres.start();

        RestAssured.config = RestAssuredConfig.config().objectMapperConfig(new ObjectMapperConfig().jackson2ObjectMapperFactory(
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
