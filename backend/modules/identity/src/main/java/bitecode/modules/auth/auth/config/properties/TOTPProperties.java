package bitecode.modules.auth.auth.config.properties;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "totp")
public class TOTPProperties {

    @NestedConfigurationProperty
    private Secret secret;
    @NestedConfigurationProperty
    private Code code;
    @NestedConfigurationProperty
    private Time time;

    private String issuer;

    @Data
    public static class Secret {
        private int length;
    }

    @Data
    public static class Code {
        private int length;
    }

    @Data
    public static class Time {
        private int period;
        private int discrepancy;
    }
}
