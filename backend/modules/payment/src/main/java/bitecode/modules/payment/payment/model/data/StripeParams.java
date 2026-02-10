package bitecode.modules.payment.payment.model.data;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class StripeParams {
    private String productId;
    private String priceId;
}
