package bitecode.modules.auth.user.model.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        String oldPassword,
        @Size(min = 6)
        String newPassword
) {
}
