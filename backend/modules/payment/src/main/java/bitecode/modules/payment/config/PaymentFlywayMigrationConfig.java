package bitecode.modules.payment.config;

import bitecode.modules._common.config.flyway.FlywayMigrationModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PaymentFlywayMigrationConfig {

    @Bean
    public FlywayMigrationModule paymentFlywayMigration() {
        return new FlywayMigrationModule("payment", "classpath:db/migration/payment");
    }
}
