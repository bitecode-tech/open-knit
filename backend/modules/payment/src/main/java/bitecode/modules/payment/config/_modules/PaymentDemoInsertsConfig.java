package bitecode.modules.payment.config._modules;

import bitecode.modules._common.config._modules.InitialInsertsConfig;
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
public class PaymentDemoInsertsConfig extends InitialInsertsConfig {

    @Bean("paymentDemoInsertsRunner")
    @Order(20)
    public CommandLineRunner paymentDemoInsertsRunner(
            DataSource dataSource,
            ResourceLoader resourceLoader,
            JdbcTemplate jdbcTemplate
    ) {
        return buildRunner(dataSource, resourceLoader, jdbcTemplate);
    }

    @Override
    protected String moduleName() {
        return "payment";
    }

    @Override
    protected List<String> scriptLocations() {
        return List.of(
                "classpath:demo-inserts/payment-inserts.sql"
        );
    }
}
