package bitecode.modules.ai.model.data;

import bitecode.modules.ai.model.enums.AiChatUi;
import bitecode.modules.ai.model.enums.AiServicesProviderType;

import java.util.List;
import java.util.UUID;

public record NoAuthAiAgentDetails(
        UUID uuid,
        String name,
        String title,
        String inputPlaceholder,
        List<String> exemplaryPrompts,
        Boolean fileUploadEnabled,
        Boolean recordingEnabled,
        AiServicesProviderType provider,
        AiChatUi chatUi,
        String chatkitWorkflowId
) {

}
