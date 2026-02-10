package bitecode.modules.ai.agent.provider;

import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.entity.AiServicesProviderConfig;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import com.azure.ai.openai.OpenAIClientBuilder;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.ai.audio.transcription.AudioTranscriptionOptions;
import org.springframework.ai.azure.openai.AzureOpenAiChatModel;
import org.springframework.ai.azure.openai.AzureOpenAiChatOptions;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.model.tool.ToolCallingChatOptions;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaChatOptions;
import org.springframework.ai.ollama.management.ModelManagementOptions;
import org.springframework.ai.ollama.management.PullModelStrategy;
import org.springframework.ai.openai.OpenAiAudioTranscriptionOptions;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.OpenAiAudioApi;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;

import javax.validation.constraints.NotNull;
import java.util.Set;
import java.util.function.Consumer;

import static bitecode.modules.ai.utils.LoggingUtils.getLoggingWebClient;

@Component
@RequiredArgsConstructor
public class ChatProviderBuilder {
    public static final Set<String> NO_TEMPERATURE_MODELS = Set.of("gpt-5", "gpt-5-nano", "gpt-5-mini");
    @Nullable
    private final OpenAIClientBuilder azureClientBuilder;
    @Nullable
    private final OllamaApi ollamaApi;

    public <T extends ChatModel> ClientConfig<T> buildClientConfig(@NotNull AiServicesProviderConfig providerConfig) {
        var provider = providerConfig.getProvider();
        if (provider == null) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI provider provider is missing");
        }

        var apiKey = providerConfig.getApiKey();
        if (provider.requiresApiKey && StringUtils.isBlank(apiKey)) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI provider API key is not configured");
        }

        return buildClientConfig(provider, apiKey, providerConfig);
    }

    public <T extends OpenAiAudioApi> RecordingClientConfig<T> buildRecordingClientConfig(@NotNull AiServicesProviderConfig providerConfig) {
        var provider = providerConfig.getProvider();
        if (provider == null) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI provider provider is missing");
        }

        var apiKey = providerConfig.getApiKey();
        if (provider.requiresApiKey && StringUtils.isBlank(apiKey)) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI provider API key is not configured");
        }

        return buildRecordingClientConfig(provider, apiKey, providerConfig);
    }

    public ToolCallingChatOptions buildChatOptions(AiAgent aiAgent, ChatModel chatModel) {
        if (NO_TEMPERATURE_MODELS.contains(aiAgent.getModel())) {
            aiAgent.setTemperature(1.0);
        }

        return switch (chatModel) {
            case OllamaChatModel ignored -> OllamaChatOptions.builder()
                    .model(aiAgent.getModel())
                    .temperature(aiAgent.getTemperature())
                    .frequencyPenalty(aiAgent.getFrequencyPenalty())
                    .presencePenalty(aiAgent.getPresencePenalty())
                    .topP(aiAgent.getTopP())
                    .numPredict(aiAgent.getMaxTokens())
                    .build();
            case OpenAiChatModel ignored -> OpenAiChatOptions.builder()
                    .model(aiAgent.getModel())
                    .temperature(aiAgent.getTemperature())
                    .frequencyPenalty(aiAgent.getFrequencyPenalty())
                    .presencePenalty(aiAgent.getPresencePenalty())
                    .topP(aiAgent.getTopP())
                    .maxTokens(aiAgent.getMaxTokens())
                    .build();
            case AzureOpenAiChatModel ignored -> buildAzureChatOptions(aiAgent.getModel(), builder -> {
                applyIfNotNull(aiAgent.getTemperature(), builder::temperature);
                applyIfNotNull(aiAgent.getTopP(), builder::topP);
                applyIfNotNull(aiAgent.getPresencePenalty(), builder::presencePenalty);
                applyIfNotNull(aiAgent.getFrequencyPenalty(), builder::frequencyPenalty);
                applyIfNotNull(aiAgent.getMaxTokens(), builder::maxTokens);
            });
            default -> throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI chat options for given provider not supported");
        };
    }

    public ToolCallingChatOptions buildVisionChatOptions(AiAgent aiAgent, ChatModel chatModel) {
        var temperature = 0.0;
        var visionModel = aiAgent.getVisionModel();

        return switch (chatModel) {
            case OllamaChatModel ignored -> OllamaChatOptions.builder()
                    .model(visionModel)
                    .temperature(temperature)
                    .build();
            case OpenAiChatModel ignored -> OpenAiChatOptions.builder()
                    .model(visionModel)
                    .temperature(temperature)
                    .build();
            case AzureOpenAiChatModel ignored -> buildAzureChatOptions(visionModel, builder -> builder
                    .temperature(temperature));
            default -> throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI vision chat options for given provider not supported");
        };
    }

    public AudioTranscriptionOptions buildRecordingChatOptions(AiAgent aiAgent, OpenAiAudioApi audioModel) {
        var temperature = 0.0f;
        var recordingModel = aiAgent.getRecordingModel();

        return switch (audioModel) {
            case OpenAiAudioApi ignored -> OpenAiAudioTranscriptionOptions.builder()
                    .model(recordingModel)
                    .temperature(temperature)
                    .responseFormat(OpenAiAudioApi.TranscriptResponseFormat.JSON)
                    .build();
        };
    }

    private <T extends ChatModel> ClientConfig<T> buildClientConfig(AiServicesProviderType provider, String apiKey, AiServicesProviderConfig providerConfig) {
        var builder = ClientConfig.<T>builder().apiKey(apiKey);

        var chatModel = switch (provider) {
            case OLLAMA -> OllamaChatModel.builder().ollamaApi(ollamaApi)
                    .modelManagementOptions(
                            ModelManagementOptions.builder().pullModelStrategy(PullModelStrategy.WHEN_MISSING).build()
                    )
                    .build();
            case OPEN_AI -> OpenAiChatModel.builder()
                    .openAiApi(OpenAiApi.builder().apiKey(apiKey).webClientBuilder(getLoggingWebClient()).build())
                    .build();
            case AZURE_AI_FOUNDRY -> AzureOpenAiChatModel.builder()
                    .openAIClientBuilder(azureClientBuilder)
                    .build();
            default -> throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI provider type is not supported");
        };

        return builder.chatModel((T) chatModel).providerConfig(providerConfig).build();
    }

    private AzureOpenAiChatOptions buildAzureChatOptions(String deploymentName,
                                                         Consumer<AzureOpenAiChatOptions.Builder> customizer) {
        if (StringUtils.isBlank(deploymentName)) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Azure deployment name is not configured for the agent");
        }

        var builder = AzureOpenAiChatOptions.builder().deploymentName(deploymentName);
        customizer.accept(builder);
        return builder.build();
    }


    private static <T> void applyIfNotNull(T value, Consumer<T> consumer) {
        if (value != null) {
            consumer.accept(value);
        }
    }

    private <T extends OpenAiAudioApi> RecordingClientConfig<T> buildRecordingClientConfig(AiServicesProviderType provider, String apiKey, AiServicesProviderConfig providerConfig) {
        var builder = RecordingClientConfig.<T>builder().apiKey(apiKey);

        var api = switch (provider) {
            case OPEN_AI -> OpenAiAudioApi.builder()
                    .apiKey(providerConfig.getApiKey())
                    .build();
            default -> throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI provider type is not supported");
        };

        return builder.api((T) api).providerConfig(providerConfig).build();
    }

    @Builder
    public record ClientConfig<T extends ChatModel>(
            T chatModel,
            String apiKey,
            AiServicesProviderConfig providerConfig
    ) {
    }

    //TODO spring-ai is missing abstraction as for 27.10.25
    @Builder
    public record RecordingClientConfig<T extends OpenAiAudioApi>(
            T api,
            String apiKey,
            AiServicesProviderConfig providerConfig
    ) {
    }
}
