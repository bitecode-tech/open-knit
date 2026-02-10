package bitecode.modules.payment.config.properties;

import bitecode.modules.payment.config.properties.app.PaymentAppProperties;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "bitecode")
public class PaymentProperties {
    @NestedConfigurationProperty
    private PaymentAppProperties app;
}
