package bitecode.modules.auth.config._modules;

import bitecode.modules._common.config._modules.InitialInsertsConfig;
import bitecode.modules.auth.auth.util.PasswordUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.List;

@Configuration
@ConditionalOnProperty(name = "DEMO_INSERTS_ENABLED", havingValue = "true")
public class IdentityDemoInsertsConfig extends InitialInsertsConfig {

    @Bean("identityDemoInsertsRunner")
    @Order(10)
    public CommandLineRunner identityDemoInsertsRunner(
            DataSource dataSource,
            ResourceLoader resourceLoader,
            JdbcTemplate jdbcTemplate,
            @Value("${demo.inserts.users.password:test123}") String demoInsertsUsersPassword
    ) {
        return (args) -> {
            ensureDemoInsertsLog(jdbcTemplate);
            Integer alreadyRan = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM _config.demo_inserts_log WHERE module_name = ?",
                    Integer.class,
                    moduleName()
            );
            if (alreadyRan != null && alreadyRan > 0) {
                return;
            }

            buildRunner(dataSource, resourceLoader, jdbcTemplate).run(args);
            updateInitialUsersPassword(jdbcTemplate, demoInsertsUsersPassword);
        };
    }

    @Override
    protected String moduleName() {
        return "identity";
    }

    @Override
    protected List<String> scriptLocations() {
        return List.of(
                "classpath:demo-inserts/user-inserts.sql"
        );
    }

    private void ensureDemoInsertsLog(JdbcTemplate jdbcTemplate) {
        jdbcTemplate.execute("""
                CREATE SCHEMA IF NOT EXISTS _config;
                CREATE TABLE IF NOT EXISTS _config.demo_inserts_log (
                    module_name VARCHAR(128) PRIMARY KEY,
                    executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
                """);
    }

    private void updateInitialUsersPassword(JdbcTemplate jdbcTemplate, String plainPassword) {
        String hashedPassword = PasswordUtils.hashPassword(plainPassword);
        jdbcTemplate.update(
                """
                        UPDATE auth."user"
                        SET password = ?
                        WHERE email IN (SELECT email FROM _config.user_email_reference)
                        """,
                hashedPassword
        );
    }
}
