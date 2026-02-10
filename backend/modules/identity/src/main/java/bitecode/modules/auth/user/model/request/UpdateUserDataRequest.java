package bitecode.modules.auth.user.model.request;

import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record UpdateUserDataRequest(
        @Size(min = 1, max = 100)
        String name,
        @Size(min = 1, max = 100)
        String surname
) {
}
