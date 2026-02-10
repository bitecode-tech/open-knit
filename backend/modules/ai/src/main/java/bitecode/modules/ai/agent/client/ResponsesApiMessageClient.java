package bitecode.modules.ai.agent.client;

import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.agent.data.EnrichedAiAgentRequestData;
import bitecode.modules.ai.agent.data.StreamingResponse;
import bitecode.modules.ai.agent.provider.openai.SimpleOpenAiClient;
import bitecode.modules.ai.model.entity.AiAgent;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;
import reactor.core.scheduler.Schedulers;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class ResponsesApiMessageClient extends AbstractMessageClient {

    public ResponsesApiMessageClient(bitecode.modules.ai.service.AiServicesProviderConfigService providerConfigService,
                                     bitecode.modules.ai.agent.provider.VectorStoreFactory vectorStoreFactory) {
        super(providerConfigService, vectorStoreFactory);
    }

    @Override
    public <T extends AiAgentRequestData> AiAgentChatResponseData message(AiAgent aiAgent, T data) {
        try {
            var providerConfig = providerConfigService.findProvider(aiAgent.getProvider())
                    .orElseThrow(() -> new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Missing AI services provider config"));
            if (providerConfig.getApiKey() == null || providerConfig.getApiKey().isBlank()) {
                throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI provider API key is not configured");
            }
            var promptData = buildPromptData(aiAgent, data, providerConfig);
            var client = new SimpleOpenAiClient(providerConfig.getApiKey());
            var contents = buildInputContent(promptData);
            var settings = buildSettings(aiAgent);
            var response = client.createResponse(aiAgent.getModel(), contents, settings, ((EnrichedAiAgentRequestData) data).getLastResponseId(), buildWebSearchTools()).block();
            if (log.isDebugEnabled()) {
                log.debug("OpenAI Responses API raw response: {}", response);
            }
            var message = extractMessage(response);
            var responseId = extractResponseId(response);
            return AiAgentChatResponseData.builder()
                    .message(message)
                    .previousResponseId(responseId)
                    .build();
        } catch (Exception ex) {
            log.error("Error Responses API for provider {} and model {}: {}", aiAgent.getProvider(), aiAgent.getModel(), ex.getMessage(), ex);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Responses API error");
        }
    }

    @Override
    public <T extends AiAgentRequestData> StreamingResponse streamMessages(AiAgent aiAgent, T data) {
        var providerConfig = providerConfigService.findProvider(aiAgent.getProvider())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Missing AI services provider config"));
        if (providerConfig.getApiKey() == null || providerConfig.getApiKey().isBlank()) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "AI provider API key is not configured");
        }

        var promptData = buildPromptData(aiAgent, data, providerConfig);
        var client = new SimpleOpenAiClient(providerConfig.getApiKey());
        var contents = buildInputContent(promptData);
        var settings = buildSettings(aiAgent);

        var responseIdSink = Sinks.<String>one();

        var textStream = client.streamResponse(aiAgent.getModel(), contents, settings, ((EnrichedAiAgentRequestData) data).getLastResponseId(), buildWebSearchTools())
                .doOnNext(chunk -> {
                    if (StringUtils.isNotBlank(chunk.responseId())) {
                        responseIdSink.tryEmitValue(chunk.responseId());
                    }
                })
                .doFinally(signalType -> responseIdSink.tryEmitEmpty())
                .flatMap(chunk -> {
                    var text = chunk.text();
                    if (text == null) {
                        return Flux.empty();
                    }
                    return Flux.just(text);
                })
                .subscribeOn(Schedulers.boundedElastic())
                .onErrorResume(ex -> {
                    if (ex instanceof org.springframework.web.reactive.function.client.WebClientResponseException webErr) {
                        log.error("Error while streaming responses for provider {} and model {}: {} - body: {}",
                                aiAgent.getProvider(), aiAgent.getModel(), webErr.getMessage(), webErr.getResponseBodyAsString(), webErr);
                    } else {
                        log.error("Error while streaming responses for provider {} and model {}: {}", aiAgent.getProvider(), aiAgent.getModel(), ex.getMessage(), ex);
                    }
                    responseIdSink.tryEmitEmpty();
                    return Flux.empty();
                });

        var responseIdMono = responseIdSink.asMono();

        return new StreamingResponse(textStream, responseIdMono);
    }

    private List<Map<String, Object>> buildWebSearchTools() {
        return List.of(Map.of("type", "web_search"));
    }

    private String extractMessage(Map<String, Object> response) {
        if (response == null || response.isEmpty()) {
            return "";
        }
        var builder = new StringBuilder();
        var output = response.get("output");
        if (output instanceof List<?> outputItems) {
            outputItems.forEach(item -> {
                if (item instanceof Map<?, ?> outputMap) {
                    var contents = outputMap.get("content");
                    if (contents instanceof List<?> contentList) {
                        contentList.forEach(content -> {
                            if (content instanceof Map<?, ?> contentMap) {
                                var text = contentMap.get("text");
                                if (text instanceof String textValue && !textValue.isBlank()) {
                                    builder.append(textValue);
                                }
                            }
                        });
                    }
                }
            });
        }
        return builder.toString();
    }

    private String extractResponseId(Map<String, Object> response) {
        if (response == null || response.isEmpty()) {
            return null;
        }
        var id = response.get("id");
        return id != null ? id.toString() : null;
    }

    private List<Map<String, Object>> buildInputContent(PromptData promptData) {
        var items = new ArrayList<Map<String, Object>>();
        for (var message : promptData.messages()) {
            var contentList = new ArrayList<Map<String, Object>>();
            contentList.add(Map.of(
                    "type", "input_text",
                    "text", message.text()
            ));
            if (message.role() == PromptRole.USER && promptData.extraContents() != null) {
                promptData.extraContents().forEach(content -> contentList.add(Map.of(
                        "type", "input_file",
                        "file_id", content.value()
                )));
            }
            var item = new LinkedHashMap<String, Object>();
            item.put("role", message.role() == PromptRole.SYSTEM ? "system" : "user");
            item.put("content", contentList);
            items.add(item);
        }
        return items;
    }

    private Map<String, Object> buildSettings(AiAgent aiAgent) {
        var settings = new LinkedHashMap<String, Object>();
        if (aiAgent.getTemperature() != null && !bitecode.modules.ai.agent.provider.ChatProviderBuilder.NO_TEMPERATURE_MODELS.contains(aiAgent.getModel())) {
            settings.put("temperature", aiAgent.getTemperature());
        }
        if (aiAgent.getTopP() != null) {
            settings.put("top_p", aiAgent.getTopP());
        }
        if (aiAgent.getMaxTokens() != null) {
            settings.put("max_output_tokens", aiAgent.getMaxTokens());
        }
        if (aiAgent.getPresencePenalty() != null) {
            settings.put("presence_penalty", aiAgent.getPresencePenalty());
        }
        if (aiAgent.getFrequencyPenalty() != null) {
            settings.put("frequency_penalty", aiAgent.getFrequencyPenalty());
        }
        return settings;
    }
}
