package bitecode.modules.auth.auth.model.request;

import jakarta.annotation.Nullable;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record SignInRequest(
        @NotBlank
        String username,
        @NotBlank
        String password,
        @Nullable
        String mfaCode,
        @Builder.Default
        boolean rememberDevice
) {
}
