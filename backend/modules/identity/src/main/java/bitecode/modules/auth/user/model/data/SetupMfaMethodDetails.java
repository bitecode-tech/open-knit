package bitecode.modules.auth.user.model.data;

import bitecode.modules.auth.auth.model.enums.MfaMethod;
import lombok.Builder;

@Builder
public record SetupMfaMethodDetails(
        MfaMethod mfaMethod,
        boolean completed,
        Boolean requiresConfirmation,
        String qrCodeImageUri
) {
}
