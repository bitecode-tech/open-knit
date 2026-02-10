package bitecode.modules.payment.payment.provider.stripe.model;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "bitecode.app.payment.provider.stripe")
public class StripeProperties {
    private String apiKey;
    private String signatureSecret;
    private String paymentSuccessUrlPath;
}
