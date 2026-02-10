package bitecode.modules.auth.user.model.request;


import bitecode.modules.auth.auth.model.enums.MfaMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import org.springframework.lang.Nullable;

@Builder
public record SetMfaRequest(
        @NotNull
        MfaMethod mfaMethod,
        @Nullable
        String code
) {
}
