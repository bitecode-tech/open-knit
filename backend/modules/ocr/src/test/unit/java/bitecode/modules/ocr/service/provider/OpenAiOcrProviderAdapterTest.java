package bitecode.modules.ocr.service.provider;

import bitecode.modules._common.client.openai.OpenAiFilesClient;
import bitecode.modules._common.client.openai.SimpleOpenAiClient;
import bitecode.modules.ocr.config.properties.OcrProperties;
import bitecode.modules.ocr.model.data.RunOcrData;
import bitecode.modules.ocr.model.entity.OcrProviderConfig;
import bitecode.modules.ocr.model.enums.OcrProviderType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

public class OpenAiOcrProviderAdapterTest {

    @Test
    @DisplayName("Should expose OpenAI provider type and accepted content types")
    void shouldExposeAcceptedContentTypes() {
        var adapter = new OpenAiOcrProviderAdapter(new OcrProperties(), mock(OpenAiFilesClient.class));

        assertThat(adapter.providerType(), is(OcrProviderType.OPEN_AI));
        assertThat(adapter.acceptedContentTypes(), contains("image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"));
    }

    @Test
    @DisplayName("Should reject unsupported file types")
    void shouldRejectUnsupportedFileTypes() {
        var adapter = new OpenAiOcrProviderAdapter(new OcrProperties(), mock(OpenAiFilesClient.class));
        var file = new MockMultipartFile("file", "notes.txt", "text/plain", "hello".getBytes(StandardCharsets.UTF_8));

        var exception = assertThrows(HttpClientErrorException.class, () -> adapter.validateFile(file));

        assertThat(exception.getStatusCode().value(), is(415));
    }

    @Test
    @DisplayName("Should extract OCR text from OpenAI response")
    void shouldExtractOcrTextFromOpenAiResponse() {
        var simpleOpenAiClient = mock(SimpleOpenAiClient.class);
        var openAiFilesClient = mock(OpenAiFilesClient.class);
        var ocrProperties = new OcrProperties();
        ocrProperties.getOpenAi().setModel("gpt-4o-mini");
        var adapter = new OpenAiOcrProviderAdapter(ocrProperties, openAiFilesClient, apiKey -> simpleOpenAiClient);
        var providerConfig = new OcrProviderConfig();
        providerConfig.setProvider(OcrProviderType.OPEN_AI);
        providerConfig.setApiKey("test-key");
        var file = new MockMultipartFile("file", "invoice.png", "image/png", "img".getBytes(StandardCharsets.UTF_8));
        var runOcrData = new RunOcrData(UUID.randomUUID(), OcrProviderType.OPEN_AI, "Invoice", "Extract invoice number", file);

        when(simpleOpenAiClient.createResponse(eq("gpt-4o-mini"), any(), any(), eq(null), eq(List.of())))
                .thenReturn(Mono.just(Map.of(
                        "output", List.of(Map.of(
                                "content", List.of(Map.of("text", "Invoice number: 42"))
                        ))
                )));

        var response = adapter.runOcr(runOcrData, providerConfig).block();

        assertThat(response.resultText(), is("Invoice number: 42"));
        assertThat(response.usageMetrics(), is(nullValue()));
    }

    @Test
    @DisplayName("Should extract OCR text from top level output_text response")
    void shouldExtractOcrTextFromTopLevelOutputTextResponse() {
        var simpleOpenAiClient = mock(SimpleOpenAiClient.class);
        var openAiFilesClient = mock(OpenAiFilesClient.class);
        var ocrProperties = new OcrProperties();
        ocrProperties.getOpenAi().setModel("gpt-4o-mini");
        var adapter = new OpenAiOcrProviderAdapter(ocrProperties, openAiFilesClient, apiKey -> simpleOpenAiClient);
        var providerConfig = new OcrProviderConfig();
        providerConfig.setProvider(OcrProviderType.OPEN_AI);
        providerConfig.setApiKey("test-key");
        var file = new MockMultipartFile("file", "invoice.png", "image/png", "img".getBytes(StandardCharsets.UTF_8));
        var runOcrData = new RunOcrData(UUID.randomUUID(), OcrProviderType.OPEN_AI, "Invoice", "Extract invoice number", file);

        when(simpleOpenAiClient.createResponse(eq("gpt-4o-mini"), any(), any(), eq(null), eq(List.of())))
                .thenReturn(Mono.just(Map.of("output_text", "Invoice number: 42")));

        var response = adapter.runOcr(runOcrData, providerConfig).block();

        assertThat(response.resultText(), is("Invoice number: 42"));
    }

    @Test
    @DisplayName("Should upload PDF file and use uploaded file id")
    void shouldUploadPdfFileAndUseUploadedFileId() {
        var simpleOpenAiClient = mock(SimpleOpenAiClient.class);
        var openAiFilesClient = mock(OpenAiFilesClient.class);
        var ocrProperties = new OcrProperties();
        ocrProperties.getOpenAi().setModel("gpt-4o-mini");
        var adapter = new OpenAiOcrProviderAdapter(ocrProperties, openAiFilesClient, apiKey -> simpleOpenAiClient);
        var providerConfig = new OcrProviderConfig();
        providerConfig.setProvider(OcrProviderType.OPEN_AI);
        providerConfig.setApiKey("test-key");
        var file = new MockMultipartFile("file", "invoice.pdf", "application/pdf", "pdf".getBytes(StandardCharsets.UTF_8));
        var runOcrData = new RunOcrData(UUID.randomUUID(), OcrProviderType.OPEN_AI, "Invoice", "Extract invoice number", file);

        when(openAiFilesClient.uploadFile(eq("test-key"), eq(file), eq(OpenAiFilesClient.Purpose.USER_DATA)))
                .thenReturn(new OpenAiFilesClient.UploadedOpenAiFile("file-123", "invoice.pdf"));
        when(simpleOpenAiClient.createResponse(eq("gpt-4o-mini"), any(), any(), eq(null), eq(List.of())))
                .thenReturn(Mono.just(Map.of(
                        "output", List.of(Map.of(
                                "content", List.of(Map.of("text", "Invoice number: 42"))
                        ))
                )));

        var response = adapter.runOcr(runOcrData, providerConfig).block();

        assertThat(response.resultText(), is("Invoice number: 42"));
    }

    @Test
    @DisplayName("Should extract usage metrics and estimate OCR cost from OpenAI response")
    void shouldExtractUsageMetricsAndEstimateOcrCostFromOpenAiResponse() {
        var simpleOpenAiClient = mock(SimpleOpenAiClient.class);
        var openAiFilesClient = mock(OpenAiFilesClient.class);
        var ocrProperties = new OcrProperties();
        ocrProperties.getOpenAi().setModel("gpt-4o-mini");
        var adapter = new OpenAiOcrProviderAdapter(ocrProperties, openAiFilesClient, apiKey -> simpleOpenAiClient);
        var providerConfig = new OcrProviderConfig();
        providerConfig.setProvider(OcrProviderType.OPEN_AI);
        providerConfig.setApiKey("test-key");
        var file = new MockMultipartFile("file", "invoice.png", "image/png", "img".getBytes(StandardCharsets.UTF_8));
        var runOcrData = new RunOcrData(UUID.randomUUID(), OcrProviderType.OPEN_AI, "Invoice", "Extract invoice number", file);

        when(simpleOpenAiClient.createResponse(eq("gpt-4o-mini"), any(), any(), eq(null), eq(List.of())))
                .thenReturn(Mono.just(Map.of(
                        "output_text", "Invoice number: 42",
                        "usage", Map.of(
                                "input_tokens", 1000,
                                "output_tokens", 500,
                                "total_tokens", 1500,
                                "input_tokens_details", Map.of("cached_tokens", 200)
                        )
                )));

        var response = adapter.runOcr(runOcrData, providerConfig).block();

        assertThat(response.resultText(), is("Invoice number: 42"));
        assertThat(response.usageMetrics().inputTokens(), is(1000));
        assertThat(response.usageMetrics().cachedInputTokens(), is(200));
        assertThat(response.usageMetrics().uncachedInputTokens(), is(800));
        assertThat(response.usageMetrics().outputTokens(), is(500));
        assertThat(response.usageMetrics().totalTokens(), is(1500));
        assertThat(response.usageMetrics().estimatedCostUsd(), is(new BigDecimal("0.000435")));
    }

    @Test
    @DisplayName("Should retry PDF OCR request after transient OpenAI file ownership validation error")
    void shouldRetryPdfOcrRequestAfterTransientOpenAiFileOwnershipValidationError() {
        var simpleOpenAiClient = mock(SimpleOpenAiClient.class);
        var openAiFilesClient = mock(OpenAiFilesClient.class);
        var ocrProperties = new OcrProperties();
        ocrProperties.getOpenAi().setModel("gpt-4o-mini");
        var adapter = new OpenAiOcrProviderAdapter(ocrProperties, openAiFilesClient, apiKey -> simpleOpenAiClient);
        var providerConfig = new OcrProviderConfig();
        providerConfig.setProvider(OcrProviderType.OPEN_AI);
        providerConfig.setApiKey("test-key");
        var file = new MockMultipartFile("file", "invoice.pdf", "application/pdf", "pdf".getBytes(StandardCharsets.UTF_8));
        var runOcrData = new RunOcrData(UUID.randomUUID(), OcrProviderType.OPEN_AI, "Invoice", "Extract invoice number", file);
        var retryableResponseException = WebClientResponseException.create(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Internal Server Error",
                HttpHeaders.EMPTY,
                "Unknown error while validating file ownership.".getBytes(StandardCharsets.UTF_8),
                StandardCharsets.UTF_8
        );

        when(openAiFilesClient.uploadFile(eq("test-key"), eq(file), eq(OpenAiFilesClient.Purpose.USER_DATA)))
                .thenReturn(new OpenAiFilesClient.UploadedOpenAiFile("file-123", "invoice.pdf"))
                .thenReturn(new OpenAiFilesClient.UploadedOpenAiFile("file-456", "invoice.pdf"));
        when(simpleOpenAiClient.createResponse(eq("gpt-4o-mini"), any(), any(), eq(null), eq(List.of())))
                .thenReturn(Mono.error(retryableResponseException))
                .thenReturn(Mono.just(Map.of("output_text", "Invoice number: 42")));

        var response = adapter.runOcr(runOcrData, providerConfig).block();

        assertThat(response.resultText(), is("Invoice number: 42"));
        verify(openAiFilesClient, times(2)).uploadFile(eq("test-key"), eq(file), eq(OpenAiFilesClient.Purpose.USER_DATA));
        verify(simpleOpenAiClient, times(2)).createResponse(eq("gpt-4o-mini"), any(), any(), eq(null), eq(List.of()));
    }
}
