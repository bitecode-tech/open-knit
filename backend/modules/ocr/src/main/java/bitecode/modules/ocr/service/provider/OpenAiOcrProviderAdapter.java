package bitecode.modules.ocr.service.provider;

import bitecode.modules._common.client.openai.OpenAiFilesClient;
import bitecode.modules._common.client.openai.OpenAiUsageMetricsResolver;
import bitecode.modules._common.client.openai.SimpleOpenAiClient;
import bitecode.modules.ocr.config.properties.OcrProperties;
import bitecode.modules.ocr.model.data.RunOcrData;
import bitecode.modules.ocr.model.data.RunOcrResponse;
import bitecode.modules.ocr.model.entity.OcrProviderConfig;
import bitecode.modules.ocr.model.enums.OcrProviderType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Component
@Slf4j
public class OpenAiOcrProviderAdapter implements OcrProviderAdapter {
    private static final int FILE_OWNERSHIP_RETRY_ATTEMPTS = 2;
    private static final Duration FILE_OWNERSHIP_RETRY_DELAY = Duration.ofSeconds(2);
    private static final List<String> ACCEPTED_CONTENT_TYPES = List.of(
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/webp",
            "application/pdf"
    );

    private final OcrProperties ocrProperties;
    private final OpenAiFilesClient openAiFilesClient;
    private final java.util.function.Function<String, SimpleOpenAiClient> clientFactory;

    @Autowired
    public OpenAiOcrProviderAdapter(OcrProperties ocrProperties, OpenAiFilesClient openAiFilesClient) {
        this.ocrProperties = ocrProperties;
        this.openAiFilesClient = openAiFilesClient;
        this.clientFactory = SimpleOpenAiClient::new;
    }

    OpenAiOcrProviderAdapter(OcrProperties ocrProperties,
                             OpenAiFilesClient openAiFilesClient,
                             java.util.function.Function<String, SimpleOpenAiClient> clientFactory) {
        this.ocrProperties = ocrProperties;
        this.openAiFilesClient = openAiFilesClient;
        this.clientFactory = clientFactory;
    }

    @Override
    public OcrProviderType providerType() {
        return OcrProviderType.OPEN_AI;
    }

    @Override
    public List<String> acceptedContentTypes() {
        return ACCEPTED_CONTENT_TYPES;
    }

    @Override
    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "File is required");
        }
        if (!StringUtils.hasText(file.getContentType()) || !ACCEPTED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new HttpClientErrorException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Unsupported file type for provider " + providerType());
        }
    }

    @Override
    public Mono<RunOcrResponse> runOcr(RunOcrData runOcrData, OcrProviderConfig providerConfig) {
        if (!StringUtils.hasText(providerConfig.getApiKey())) {
            return Mono.error(new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "OCR provider API key is not configured"));
        }

        if (log.isDebugEnabled()) {
            var file = runOcrData.file();
            log.debug(
                    "Submitting OCR file to OpenAI: filename={}, contentType={}, sizeBytes={}, model={}",
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize(),
                    ocrProperties.getOpenAi().getModel()
            );
        }

        var client = clientFactory.apply(providerConfig.getApiKey());
        var model = ocrProperties.getOpenAi().getModel();
        var settings = Map.<String, Object>of(
                "temperature", 0.0,
                "max_output_tokens", 4000
        );

        return runOcrAttempt(runOcrData, providerConfig.getApiKey(), client, model, settings, 0)
                .map(response -> new RunOcrResponse(
                        extractMessage(response),
                        OpenAiUsageMetricsResolver.build(response, model)
                ));
    }

    private Mono<Map<String, Object>> runOcrAttempt(RunOcrData runOcrData,
                                                    String apiKey,
                                                    SimpleOpenAiClient client,
                                                    String model,
                                                    Map<String, Object> settings,
                                                    int attempt) {
        return Mono.fromCallable(() -> buildInput(runOcrData, apiKey))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(input -> client.createResponse(model, input, settings, null, List.of()))
                .onErrorResume(throwable -> {
                    if (!shouldRetryFileOwnershipValidation(throwable) || attempt >= FILE_OWNERSHIP_RETRY_ATTEMPTS) {
                        return Mono.error(throwable);
                    }

                    log.warn("OpenAI file ownership validation failed for OCR request. Retrying upload and response request, attempt {}", attempt + 1);
                    return Mono.delay(FILE_OWNERSHIP_RETRY_DELAY)
                            .then(runOcrAttempt(runOcrData, apiKey, client, model, settings, attempt + 1));
                });
    }

    private List<Map<String, Object>> buildInput(RunOcrData runOcrData, String apiKey) {
        try {
            var file = runOcrData.file();
            var contentItems = new java.util.ArrayList<Map<String, Object>>();
            contentItems.add(Map.of(
                    "type", "input_text",
                    "text", buildPrompt(runOcrData)
            ));

            if (file.getContentType() != null && file.getContentType().startsWith("image/")) {
                contentItems.add(Map.of(
                        "type", "input_image",
                        "image_url", "data:" + file.getContentType() + ";base64," + Base64.getEncoder().encodeToString(file.getBytes())
                ));
            } else {
                var uploadedFile = openAiFilesClient.uploadFile(apiKey, file, OpenAiFilesClient.Purpose.USER_DATA);
                contentItems.add(Map.of(
                        "type", "input_file",
                        "file_id", uploadedFile.id()
                ));
            }

            return List.of(Map.of(
                    "role", "user",
                    "content", contentItems
            ));
        } catch (IOException e) {
            throw new HttpClientErrorException(HttpStatus.NOT_ACCEPTABLE, "Failed to read OCR file");
        }
    }

    private String buildPrompt(RunOcrData runOcrData) {
        return """
                You are performing OCR extraction on an uploaded file.
                Extract only the information requested below.
                Return plain text only without markdown fences.

                Requested extraction:
                %s
                """.formatted(runOcrData.instructionTextSnapshot());
    }

    private boolean shouldRetryFileOwnershipValidation(Throwable throwable) {
        if (!(throwable instanceof WebClientResponseException responseException)) {
            return false;
        }

        var responseBody = responseException.getResponseBodyAsString();
        return responseException.getStatusCode().is5xxServerError()
                && responseBody != null
                && responseBody.contains("Unknown error while validating file ownership.");
    }

    private String extractMessage(Map<String, Object> response) {
        if (response == null || response.isEmpty()) {
            return "";
        }
        var outputText = response.get("output_text");
        if (outputText instanceof String outputTextValue && !outputTextValue.isBlank()) {
            return outputTextValue.trim();
        }
        if (outputText instanceof List<?> outputTextItems) {
            var outputTextBuilder = new StringBuilder();
            outputTextItems.forEach(item -> {
                if (item instanceof String textValue && !textValue.isBlank()) {
                    if (!outputTextBuilder.isEmpty()) {
                        outputTextBuilder.append("\n");
                    }
                    outputTextBuilder.append(textValue.trim());
                }
            });
            if (!outputTextBuilder.isEmpty()) {
                return outputTextBuilder.toString();
            }
        }
        var builder = new StringBuilder();
        var output = response.get("output");
        if (output instanceof List<?> outputItems) {
            outputItems.forEach(item -> {
                if (item instanceof Map<?, ?> outputMap) {
                    var content = outputMap.get("content");
                    if (content instanceof List<?> contentItems) {
                        contentItems.forEach(contentItem -> {
                            if (contentItem instanceof Map<?, ?> contentMap) {
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
        return builder.toString().trim();
    }
}
