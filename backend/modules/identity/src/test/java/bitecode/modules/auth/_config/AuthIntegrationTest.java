package bitecode.modules.auth._config;

import bitecode.modules._common.BaseIntegrationTest;
import bitecode.modules._common.TestApplication;
import bitecode.modules._common.config.IntegrationTestConfig;
import bitecode.modules._common.utils.TestDataFactory;
import groovy.util.logging.Slf4j;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;

@Slf4j
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        classes = {TestApplication.class, IntegrationTestConfig.class})
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@AutoConfigureMockMvc
public class AuthIntegrationTest extends BaseIntegrationTest {

    @Autowired
    protected TestDataFactory testDataFactory;
}
