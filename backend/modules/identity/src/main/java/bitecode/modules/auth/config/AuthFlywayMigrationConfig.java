package bitecode.modules.auth.config;

import bitecode.modules._common.config.flyway.FlywayMigrationModule;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthFlywayMigrationConfig {

    @Bean
    public FlywayMigrationModule authFlywayMigration() {
        return new FlywayMigrationModule("auth", "classpath:db/migration/auth");
    }

    @Bean
    @ConditionalOnProperty(name = "flyway.seed.data", havingValue = "true")
    public FlywayMigrationModule authSeedFlywayMigration() {
        return new FlywayMigrationModule("auth", "classpath:db/migration/auth_seed");
    }
}
