package bitecode.modules.payment.subscription.model.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.springframework.lang.Nullable;

import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NewSubscriptionRequest {
    @NotBlank
    private UUID planId;
    @NotBlank
    private String userId;
    @Nullable
    private ZonedDateTime startTime;
}
