package bitecode.modules.wallet.config;

import bitecode.modules._common.config.flyway.FlywayMigrationModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WalletFlywayMigrationConfig {

    @Bean
    public FlywayMigrationModule walletFlywayMigration() {
        return new FlywayMigrationModule("wallet", "classpath:db/migration/wallet");
    }
}
