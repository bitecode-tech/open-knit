package bitecode.modules._common.config;

import bitecode.modules._common.config.flyway.FlywayMigrationModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.exception.FlywayValidateException;
import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class FlywayConfig implements FlywayMigrationStrategy {
    private final List<FlywayMigrationModule> migrations;

    @Override
    public void migrate(Flyway flyway) {
        var dataSource = flyway.getConfiguration().getDataSource();
        if (migrations == null || migrations.isEmpty()) {
            log.warn("No module Flyway migrations configured.");
            return;
        }

        migrations.stream()
                .sorted(Comparator.comparing(FlywayMigrationModule::schema)
                        .thenComparing(FlywayMigrationModule::location))
                .forEach(migration -> {
                    if (!migration.location().contains(migration.schema())) {
                        throw new RuntimeException("[Schema,location] pair [%s, %s] do not match!"
                                .formatted(migration.location(), migration.schema()));
                    }

                    var migrationConfig = Flyway.configure()
                            .schemas(migration.schema())
                            .locations(migration.location())
                            .dataSource(dataSource)
                            .load();

                    try {
                        migrationConfig.migrate();
                        migrationConfig.validate();
                    } catch (FlywayValidateException e) {
                        throw new RuntimeException("Flyway validation failed for schema: %s"
                                .formatted(migrationConfig.getConfiguration().getSchemas()[0]), e);
                    }
                });
    }
}
