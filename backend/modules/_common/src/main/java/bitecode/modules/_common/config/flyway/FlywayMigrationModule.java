package bitecode.modules._common.config.flyway;

public record FlywayMigrationModule(
        String schema,
        String location
) {
}
