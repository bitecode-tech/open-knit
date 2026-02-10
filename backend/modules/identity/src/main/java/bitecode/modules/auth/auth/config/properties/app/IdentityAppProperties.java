package bitecode.modules.auth.auth.config.properties.app;

import bitecode.modules._common.config.properties.app.AppProperties;
import bitecode.modules.auth.auth.config.properties.user.UserProperties;
import lombok.Data;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@Data
public class IdentityAppProperties extends AppProperties {
    @NestedConfigurationProperty
    private UserProperties user;
}
