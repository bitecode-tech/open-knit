package bitecode.modules._common.config._modules;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;
import java.util.List;

@Slf4j
public abstract class InitialInsertsConfig {

    protected abstract String moduleName();

    protected abstract List<String> scriptLocations();

    protected CommandLineRunner buildRunner(DataSource dataSource, ResourceLoader resourceLoader, JdbcTemplate jdbcTemplate) {
        return (args) -> {
            var populator = new ResourceDatabasePopulator();
            populator.setContinueOnError(false);

            jdbcTemplate.execute("""
                    CREATE SCHEMA IF NOT EXISTS _config;
                    CREATE TABLE IF NOT EXISTS _config.demo_inserts_log (
                        module_name VARCHAR(128) PRIMARY KEY,
                        executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                    """);

            Integer alreadyRan = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM _config.demo_inserts_log WHERE module_name = ?",
                    Integer.class,
                    moduleName()
            );
            if (alreadyRan != null && alreadyRan > 0) {
                return;
            }

            for (var location : scriptLocations()) {
                Resource resource = resourceLoader.getResource(location);
                if (resource.exists()) {
                    log.info("Loading initial inserts script: module={}, location={}", moduleName(), location);
                    populator.addScript(resource);
                } else {
                    log.info("Initial inserts script not found, skipping: module={}, location={}", moduleName(), location);
                }
            }

            populator.execute(dataSource);
            log.info("Initial inserts scripts executed: module={}", moduleName());

            jdbcTemplate.update(
                    "INSERT INTO _config.demo_inserts_log (module_name) VALUES (?)",
                    moduleName()
            );
        };
    }
}
