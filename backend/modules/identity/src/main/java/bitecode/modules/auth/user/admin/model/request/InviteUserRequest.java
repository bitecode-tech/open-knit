package bitecode.modules.auth.user.admin.model.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public record InviteUserRequest(
        String firstName,
        String lastName,
        @NotBlank
        @Email
        String email,
        @NotBlank
        String role
) {
}
