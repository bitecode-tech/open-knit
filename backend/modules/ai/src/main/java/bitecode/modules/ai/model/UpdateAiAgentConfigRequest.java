package bitecode.modules.ai.model;

import bitecode.modules.ai.model.enums.AiChatUi;
import bitecode.modules.ai.model.enums.AiServicesProviderType;

import java.util.List;
import java.util.Optional;

public record UpdateAiAgentConfigRequest(
        Optional<String> name,
        Optional<AiServicesProviderType> provider,
        Optional<String> model,
        Optional<String> visionModel,
        Optional<String> recordingModel,
        Optional<String> title,
        Optional<String> inputPlaceholder,
        Optional<String> systemMessage,
        Optional<Boolean> testMode,
        Optional<String> accessPassword,
        Optional<Boolean> accessPasswordEnabled,
        Optional<List<String>> exemplaryPrompts,
        Optional<Double> temperature,
        Optional<Double> topP,
        Optional<Integer> maxTokens,
        Optional<Double> presencePenalty,
        Optional<Double> frequencyPenalty,
        Optional<Integer> shortTermMemoryLastMessages,
        Optional<Boolean> fileUploadEnabled,
        Optional<Boolean> recordingEnabled,
        Optional<AiChatUi> chatUi,
        Optional<String> chatkitWorkflowId
) {
}
