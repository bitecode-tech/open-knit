package bitecode.modules.transaction.config;

import bitecode.modules._common.config.flyway.FlywayMigrationModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TransactionFlywayMigrationConfig {

    @Bean
    public FlywayMigrationModule transactionFlywayMigration() {
        return new FlywayMigrationModule("transaction", "classpath:db/migration/transaction");
    }
}
