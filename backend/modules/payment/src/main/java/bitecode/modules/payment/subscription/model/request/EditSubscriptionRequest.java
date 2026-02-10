package bitecode.modules.payment.subscription.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.lang.Nullable;

import java.time.ZonedDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EditSubscriptionRequest {
    @NotBlank
    private String planName;
    @NotBlank
    private String userId;
    @Nullable
    private ZonedDateTime startTime;
}
