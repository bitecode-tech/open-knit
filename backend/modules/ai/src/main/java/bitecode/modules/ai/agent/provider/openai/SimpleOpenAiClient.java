package bitecode.modules.ai.agent.provider.openai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;

/**
 * Minimal OpenAI client using Spring WebClient so we can fully control the Responses API payloads
 * and ChatKit session minting requests.
 */

@Slf4j
public class SimpleOpenAiClient {

    private static final String DEFAULT_BASE_URL = "https://api.openai.com/v1";
    private static final String RESPONSES_ENDPOINT = "/responses";
    private static final String CHATKIT_SESSION_ENDPOINT = "/chatkit/sessions";
    private static final String CHATKIT_BETA_HEADER = "chatkit_beta=v1";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private final WebClient webClient;
    private final String organizationId;
    private final String projectId;
    private final String chatkitBetaHeaderValue;

    public SimpleOpenAiClient(String apiKey) {
        this(apiKey, DEFAULT_BASE_URL, null, null);
    }

    public SimpleOpenAiClient(String apiKey, String organizationId, String projectId) {
        this(apiKey, DEFAULT_BASE_URL, organizationId, projectId);
    }

    public SimpleOpenAiClient(String apiKey, String baseUrl, String organizationId, String projectId) {
        this(WebClient.builder()
                        .baseUrl(baseUrl != null ? baseUrl : DEFAULT_BASE_URL)
                        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE),
                organizationId,
                projectId,
                CHATKIT_BETA_HEADER);
    }

    private SimpleOpenAiClient(WebClient.Builder builder, String organizationId, String projectId, String chatkitBetaHeaderValue) {
        this.webClient = builder
                .filter(logRequest())
                .filter(logResponse())
                .build();
        this.organizationId = organizationId;
        this.projectId = projectId;
        this.chatkitBetaHeaderValue = chatkitBetaHeaderValue;
    }

    public Mono<Map<String, Object>> createResponse(String model,
                                                    List<Map<String, Object>> contents,
                                                    Map<String, Object> settings,
                                                    String previousResponseId,
                                                    List<Map<String, Object>> tools) {
        var body = buildRequest(model, contents, settings, previousResponseId, false, tools);
        if (log.isDebugEnabled()) {
            log.debug("OpenAI request body (responses create): {}", body);
        }
        return webClient.post()
                .uri(RESPONSES_ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .doOnNext(resp -> log.debug("OpenAI response body (create): {}", resp));
    }

    public Flux<StreamChunk> streamResponse(String model,
                                            List<Map<String, Object>> contents,
                                            Map<String, Object> settings,
                                            String previousResponseId,
                                            List<Map<String, Object>> tools) {
        var body = buildRequest(model, contents, settings, previousResponseId, true, tools);
        if (log.isDebugEnabled()) {
            log.debug("OpenAI request body (responses stream): {}", body);
        }
        return webClient.post()
                .uri(RESPONSES_ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .flatMap(this::extractTextFromStream);
    }

    public Mono<String> mintChatkitClientSecret(String workflowId,
                                                String user,
                                                String existingClientSecret) {
        if (workflowId == null || workflowId.isBlank()) {
            return Mono.error(new IllegalStateException("ChatKit workflow ID is missing"));
        }

        var workflow = Map.of("id", workflowId);
        var resolvedUser = (user != null && !user.isBlank()) ? user : "anonymous";

        Map<String, Object> payload = existingClientSecret != null
                ? Map.of("client_secret", existingClientSecret, "workflow", workflow, "user", resolvedUser)
                : Map.of("workflow", workflow, "user", resolvedUser);

        if (log.isDebugEnabled()) {
            log.debug("ChatKit session request body: {}", payload);
        }

        return webClient.post()
                .uri(CHATKIT_SESSION_ENDPOINT)
                .headers(headers -> {
                    headers.setContentType(MediaType.APPLICATION_JSON);
                    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
                    headers.set(HttpHeaders.ACCEPT_ENCODING, "gzip");
                    headers.add("OpenAI-Beta", chatkitBetaHeaderValue);
                    if (organizationId != null && !organizationId.isBlank()) {
                        headers.add("OpenAI-Organization", organizationId);
                    }
                    if (projectId != null && !projectId.isBlank()) {
                        headers.add("OpenAI-Project", projectId);
                    }
                })
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(String.class)
                .map(this::extractClientSecretFromChatkitResponse);
    }

    private Map<String, Object> buildRequest(String model,
                                             List<Map<String, Object>> contents,
                                             Map<String, Object> settings,
                                             String previousResponseId,
                                             boolean stream,
                                             List<Map<String, Object>> tools) {
        var request = new LinkedHashMap<String, Object>();
        request.put("model", model);
        request.put("input", contents);
        if (settings != null) {
            request.putAll(settings);
        }
        if (previousResponseId != null && !previousResponseId.isBlank()) {
            request.put("previous_response_id", previousResponseId);
        }
        if (tools != null && !tools.isEmpty()) {
            request.put("tools", tools);
        }
        if (stream) {
            request.put("stream", true);
        }
        return request;
    }

    private String extractClientSecretFromChatkitResponse(String responseBody) {
        if (!StringUtils.hasText(responseBody)) {
            throw new IllegalStateException("Missing body in ChatKit session response");
        }
        try {
            var root = OBJECT_MAPPER.readTree(responseBody);
            var secret = root.path("client_secret").asText(null);
            if (!StringUtils.hasText(secret)) {
                throw new IllegalStateException("Missing client_secret in ChatKit session response: " + responseBody);
            }
            return secret;
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to parse ChatKit session response", ex);
        }
    }

    private Flux<StreamChunk> extractTextFromStream(String chunk) {
        if (chunk == null || chunk.isBlank()) {
            return Flux.empty();
        }
        var cleanedChunk = chunk.trim();
        if (cleanedChunk.startsWith("data:")) {
            cleanedChunk = cleanedChunk.substring(5).trim();
        }
        if ("[DONE]".equalsIgnoreCase(cleanedChunk)) {
            return Flux.empty();
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(cleanedChunk);
            List<StreamChunk> parts = new ArrayList<>();
            var responseId = extractResponseId(root);
            collectText(root, parts, responseId);
            if (responseId != null && parts.isEmpty()) {
                parts.add(new StreamChunk(null, responseId));
            }
            return Flux.fromIterable(parts)
                    .filter(Objects::nonNull)
                    .filter(part -> part.text() != null || part.responseId() != null);
        } catch (Exception ex) {
            log.warn("Failed to parse streaming chunk from OpenAI Responses API: {} - chunk: {}", ex.getMessage(), cleanedChunk);
            return Flux.empty();
        }
    }

    private void collectText(JsonNode node, List<StreamChunk> sink, String responseId) {
        if (node == null) {
            return;
        }
        if (node.has("output_text_delta") && node.get("output_text_delta").isTextual()) {
            sink.add(new StreamChunk(node.get("output_text_delta").asText(), responseId));
        }
        if (node.has("delta") && node.get("delta").isTextual()) {
            sink.add(new StreamChunk(node.get("delta").asText(), responseId));
        }
        var dataNode = node.get("data");
        if (dataNode != null && !dataNode.isMissingNode()) {
            collectText(dataNode, sink, responseId);
        }
        var outputNode = node.get("output");
        if (outputNode != null && outputNode.isArray()) {
            outputNode.forEach(item -> {
                var contentNode = item.get("content");
                if (contentNode != null && contentNode.isArray()) {
                    contentNode.forEach(content -> {
                        var textNode = content.get("text");
                        if (textNode != null && textNode.isTextual()) {
                            sink.add(new StreamChunk(textNode.asText(), responseId));
                        }
                    });
                }
            });
        }
    }

    private String extractResponseId(JsonNode root) {
        if (root == null) {
            return null;
        }
        if (root.has("id") && root.get("id").isTextual()) {
            return root.get("id").asText();
        }
        var dataNode = root.get("data");
        if (dataNode != null && dataNode.has("id") && dataNode.get("id").isTextual()) {
            return dataNode.get("id").asText();
        }
        var responseNode = root.get("response");
        if (responseNode != null && responseNode.has("id") && responseNode.get("id").isTextual()) {
            return responseNode.get("id").asText();
        }
        return null;
    }

    private ExchangeFilterFunction logRequest() {
        return ExchangeFilterFunction.ofRequestProcessor(clientRequest -> {
            if (log.isDebugEnabled()) {
                log.debug("OpenAI request {} {}", clientRequest.method(), clientRequest.url());
                log.debug("OpenAI request headers: {}", clientRequest.headers());
            }
            return Mono.just(clientRequest);
        });
    }

    private ExchangeFilterFunction logResponse() {
        return ExchangeFilterFunction.ofResponseProcessor(response -> {
            log.debug("OpenAI response status: {}", response.statusCode());
            if (log.isDebugEnabled()) {
                log.debug("OpenAI response headers: {}", response.headers().asHttpHeaders());
            }
            return Mono.just(response);
        });
    }

    public record StreamChunk(String text, String responseId) {
    }
}
