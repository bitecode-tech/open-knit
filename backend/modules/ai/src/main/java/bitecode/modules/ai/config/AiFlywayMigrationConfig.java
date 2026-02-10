package bitecode.modules.ai.config;

import bitecode.modules._common.config.flyway.FlywayMigrationModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiFlywayMigrationConfig {

    @Bean
    public FlywayMigrationModule aiFlywayMigration() {
        return new FlywayMigrationModule("ai", "classpath:db/migration/ai");
    }
}
