package bitecode.modules.payment.subscription.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewSubscriptionPlanRequest {
    @NotBlank
    private String name;
    @PositiveOrZero
    private BigDecimal price;
    @NotBlank
    private String currency;
    @NotNull
    private ChronoUnit paymentFrequencyType;
    @PositiveOrZero
    private Long paymentFrequency;
}
