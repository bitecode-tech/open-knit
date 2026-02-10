package bitecode.modules.auth.user.model.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;

@Builder
public record SignUpRequest(
        @Email
        String email,
        @Size(min = 6)
        String password
) {
}
