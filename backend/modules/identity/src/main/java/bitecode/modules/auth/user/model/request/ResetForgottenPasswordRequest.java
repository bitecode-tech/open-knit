package bitecode.modules.auth.user.model.request;

public record ResetForgottenPasswordRequest(
        String verificationCode,
        int pin,
        String newPassword
) {
}