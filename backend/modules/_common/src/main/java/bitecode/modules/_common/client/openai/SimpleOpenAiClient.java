package bitecode.modules._common.client.openai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Minimal OpenAI client using Spring WebClient so we can fully control the Responses API payloads
 * and ChatKit session minting requests.
 */
@Slf4j
public class SimpleOpenAiClient {

    private static final String DEFAULT_BASE_URL = "https://api.openai.com/v1";
    private static final Duration OPEN_AI_RESPONSE_TIMEOUT = Duration.ofMinutes(3);
    private static final String RESPONSES_ENDPOINT = "/responses";
    private static final String CHATKIT_SESSION_ENDPOINT = "/chatkit/sessions";
    private static final String CHATKIT_BETA_HEADER = "chatkit_beta=v1";
    private static final int TOO_MANY_REQUESTS_RETRY_ATTEMPTS = 2;
    private static final Duration TOO_MANY_REQUESTS_RETRY_DELAY = Duration.ofSeconds(45);
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
        this(createWebClientBuilder(apiKey, baseUrl),
                organizationId,
                projectId,
                CHATKIT_BETA_HEADER);
    }

    private static WebClient.Builder createWebClientBuilder(String apiKey, String baseUrl) {
        var httpClient = HttpClient.create()
                .responseTimeout(OPEN_AI_RESPONSE_TIMEOUT);
        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .baseUrl(baseUrl != null ? baseUrl : DEFAULT_BASE_URL)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
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
            log.debug("OpenAI responses create request prepared for model {}", model);
        }
        return webClient.post()
                .uri(RESPONSES_ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .retryWhen(openAiTooManyRequestsRetry())
                .onErrorMap(this::shouldMapOpenAiException, this::toOpenAiException);
    }

    public Flux<StreamChunk> streamResponse(String model,
                                            List<Map<String, Object>> contents,
                                            Map<String, Object> settings,
                                            String previousResponseId,
                                            List<Map<String, Object>> tools) {
        var body = buildRequest(model, contents, settings, previousResponseId, true, tools);
        if (log.isDebugEnabled()) {
            log.debug("OpenAI responses stream request prepared for model {}", model);
        }
        return webClient.post()
                .uri(RESPONSES_ENDPOINT)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(body)
                .retrieve()
                .bodyToFlux(String.class)
                .retryWhen(openAiTooManyRequestsRetry())
                .onErrorMap(this::shouldMapOpenAiException, this::toOpenAiException)
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
            log.debug("ChatKit session request prepared for workflow {}", workflowId);
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
            }
            return Mono.just(clientRequest);
        });
    }

    private ExchangeFilterFunction logResponse() {
        return ExchangeFilterFunction.ofResponseProcessor(clientResponse -> {
            if (log.isDebugEnabled()) {
                log.debug("OpenAI response status: {}", clientResponse.statusCode());
            }
            return Mono.just(clientResponse);
        });
    }

    private boolean shouldMapOpenAiException(Throwable throwable) {
        return throwable instanceof WebClientResponseException || throwable instanceof WebClientRequestException;
    }

    private RuntimeException toOpenAiException(Throwable throwable) {
        var retryableException = OpenAiErrorClassifier.toRetryableException(throwable);
        if (retryableException != null) {
            log.warn("OpenAI request failed with retryable error: {}", retryableException.getMessage());
            return retryableException;
        }
        if (throwable instanceof WebClientResponseException responseException) {
            return toOpenAiResponseException(responseException);
        }
        return throwable instanceof RuntimeException runtimeException ? runtimeException : new RuntimeException(throwable);
    }

    private RuntimeException toOpenAiResponseException(WebClientResponseException exception) {
        var responseBody = exception.getResponseBodyAsString();
        if (StringUtils.hasText(responseBody)) {
            log.warn("OpenAI request failed with status {} and body {}", exception.getStatusCode(), responseBody);
        } else {
            log.warn("OpenAI request failed with status {}", exception.getStatusCode());
        }
        return exception;
    }

    private Retry openAiTooManyRequestsRetry() {
        return Retry.from(retrySignals -> retrySignals.flatMap(retrySignal -> {
            var throwable = retrySignal.failure();
            if (!(throwable instanceof WebClientResponseException responseException)) {
                return Mono.error(throwable);
            }
            if (responseException.getStatusCode().value() != 429 || retrySignal.totalRetries() >= TOO_MANY_REQUESTS_RETRY_ATTEMPTS) {
                return Mono.error(throwable);
            }

            var delay = resolveRetryDelay(responseException);
            log.warn(
                    "OpenAI request was rate limited. Retrying attempt {}/{} after {} seconds",
                    retrySignal.totalRetries() + 1,
                    TOO_MANY_REQUESTS_RETRY_ATTEMPTS,
                    delay.toSeconds()
            );
            return Mono.delay(delay).then();
        }));
    }

    private Duration resolveRetryDelay(WebClientResponseException exception) {
        var retryAfter = exception.getHeaders().getFirst(HttpHeaders.RETRY_AFTER);
        if (!StringUtils.hasText(retryAfter)) {
            return TOO_MANY_REQUESTS_RETRY_DELAY;
        }
        try {
            return maxDelay(Duration.ofSeconds(Long.parseLong(retryAfter.trim())));
        } catch (NumberFormatException ignored) {
            try {
                var retryAt = ZonedDateTime.parse(retryAfter.trim());
                return maxDelay(Duration.between(ZonedDateTime.now(), retryAt));
            } catch (DateTimeParseException ignoredAgain) {
                return TOO_MANY_REQUESTS_RETRY_DELAY;
            }
        }
    }

    private Duration maxDelay(Duration retryAfterDelay) {
        if (retryAfterDelay.isNegative() || retryAfterDelay.isZero()) {
            return TOO_MANY_REQUESTS_RETRY_DELAY;
        }
        return retryAfterDelay.compareTo(TOO_MANY_REQUESTS_RETRY_DELAY) > 0 ? retryAfterDelay : TOO_MANY_REQUESTS_RETRY_DELAY;
    }

    public record StreamChunk(String text, String responseId) {
    }
}
