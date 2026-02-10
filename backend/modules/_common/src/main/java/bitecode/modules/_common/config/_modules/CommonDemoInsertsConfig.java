package bitecode.modules._common.config._modules;

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
public class CommonDemoInsertsConfig extends InitialInsertsConfig {

    @Bean("commonDemoInsertsRunner")
    @Order(0)
    public CommandLineRunner commonDemoInsertsRunner(
            DataSource dataSource,
            ResourceLoader resourceLoader,
            JdbcTemplate jdbcTemplate
    ) {
        return buildRunner(dataSource, resourceLoader, jdbcTemplate);
    }

    @Override
    protected String moduleName() {
        return "common";
    }

    @Override
    protected List<String> scriptLocations() {
        return List.of(
                "classpath:demo-inserts/user-email-reference.sql"
        );
    }
}
