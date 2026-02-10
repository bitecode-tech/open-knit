package bitecode.modules.auth.user.model.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record ResendVerificationEmailRequest(
        @Email
        String email
) {
}
