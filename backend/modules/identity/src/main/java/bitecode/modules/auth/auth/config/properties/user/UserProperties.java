package bitecode.modules.auth.auth.config.properties.user;

import bitecode.modules.auth.auth.config.properties.user.resetpassword.ResetPasswordProperties;
import lombok.Data;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@Data
public class UserProperties {
    @NestedConfigurationProperty
    private ResetPasswordProperties passwordReset;
    private String userInviteUrlPath;
    private String confirmEmailUrlPath;
}
