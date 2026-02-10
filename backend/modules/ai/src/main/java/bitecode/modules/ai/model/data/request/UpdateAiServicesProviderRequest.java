package bitecode.modules.ai.model.data.request;

import bitecode.modules.ai.model.enums.AiServicesProviderType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAiServicesProviderRequest {
    @NotNull
    private AiServicesProviderType provider;
    private String apiKey;
}
