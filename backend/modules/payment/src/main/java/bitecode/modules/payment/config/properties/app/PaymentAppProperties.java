package bitecode.modules.payment.config.properties.app;

import bitecode.modules._common.config.properties.app.AppProperties;
import bitecode.modules.payment.payment.provider.stripe.model.StripeProperties;
import lombok.Data;
import org.springframework.boot.context.properties.NestedConfigurationProperty;

@Data
public class PaymentAppProperties extends AppProperties {
    @NestedConfigurationProperty
    private PaymentConfig payment;

    @Data
    public static class PaymentConfig {
        @NestedConfigurationProperty
        private ProviderConfig provider;

        @Data
        public static class ProviderConfig {
            @NestedConfigurationProperty
            private StripeProperties stripe;
        }
    }
}
