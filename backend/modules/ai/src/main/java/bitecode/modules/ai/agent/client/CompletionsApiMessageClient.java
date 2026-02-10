package bitecode.modules.ai.agent.client;

import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.agent.data.StreamingResponse;
import bitecode.modules.ai.agent.provider.ChatProviderBuilder;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.service.AiServicesProviderConfigService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;
import reactor.util.retry.Retry;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeoutException;

@Slf4j
@Component
public class CompletionsApiMessageClient extends AbstractMessageClient {

    private final ChatProviderBuilder chatProviderBuilder;

    public CompletionsApiMessageClient(AiServicesProviderConfigService providerConfigService,
                                       bitecode.modules.ai.agent.provider.VectorStoreFactory vectorStoreFactory,
                                       ChatProviderBuilder chatProviderBuilder) {
        super(providerConfigService, vectorStoreFactory);
        this.chatProviderBuilder = chatProviderBuilder;
    }

    @Override
    public AiAgentChatResponseData message(AiAgent aiAgent, AiAgentRequestData data) {
        var chatProviderConfig = chatProviderBuilder.buildClientConfig(providerConfigService.findProvider(aiAgent.getProvider())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Missing AI services provider config")));
        var chatModel = chatProviderConfig.chatModel();

        var promptData = buildPromptData(aiAgent, data, chatProviderConfig.providerConfig());
        var prompt = new Prompt((List<Message>) toSpringMessages(promptData), chatProviderBuilder.buildChatOptions(aiAgent, chatModel));

        try {
            var response = chatModel.call(prompt);
            var responseMessage = response.getResult().getOutput().getText();
            return AiAgentChatResponseData.builder().message(responseMessage).build();
        } catch (Exception e) {
            if (e instanceof NonTransientAiException aiErr && aiErr.getMessage() != null) {
                if (aiErr.getMessage().contains("Rate limit reached")) {
                    throw new HttpClientErrorException(HttpStatus.BANDWIDTH_LIMIT_EXCEEDED, "Rate limit reached");
                }
            }
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid API key or missing quota");
        }
    }

    @Override
    public <T extends AiAgentRequestData> StreamingResponse streamMessages(AiAgent aiAgent, T data) {
        var chatProviderConfig = chatProviderBuilder.buildClientConfig(providerConfigService.findProvider(aiAgent.getProvider())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Missing AI services provider config")));
        var chatModel = chatProviderConfig.chatModel();
        var promptData = buildPromptData(aiAgent, data, chatProviderConfig.providerConfig());
        var prompt = new Prompt((List<Message>) toSpringMessages(promptData), chatProviderBuilder.buildChatOptions(aiAgent, chatModel));
        var stream = chatModel.stream(prompt)
                .filter(Objects::nonNull)
                .mapNotNull(response -> {
                    if (response.getResult() == null || response.getResult().getOutput() == null) {
                        log.warn("Received empty ChatResponse or result from provider {} for agent model {}", aiAgent.getProvider(), aiAgent.getModel());
                        return null;
                    }
                    return response.getResult().getOutput().getText(); // only pass valid responses downstream
                }).onErrorResume(ex -> {
                    var responseBody = extractResponseBody(ex);
                    log.error("Error while streaming response from provider {} for agent model {}: {}. Response body: {}",
                            aiAgent.getProvider(), aiAgent.getModel(), ex.getMessage(), responseBody, ex);
                    return Flux.empty(); // prevents breaking the stream
                })
                .retryWhen(Retry.fixedDelay(2, Duration.ofSeconds(1))
                        .filter(ex -> ex instanceof WebClientResponseException
                                || ex instanceof IOException
                                || ex instanceof TimeoutException));

        return new StreamingResponse(stream);
    }
}
