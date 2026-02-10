package bitecode.modules.auth.auth.config.properties;

import bitecode.modules.auth.auth.config.properties.app.IdentityAppProperties;
import bitecode.modules.auth.auth.config.properties.security.SecurityProperties;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "bitecode")
public class AuthProperties {
    @NestedConfigurationProperty
    private SecurityProperties security;

    @NestedConfigurationProperty
    private IdentityAppProperties app;
}
