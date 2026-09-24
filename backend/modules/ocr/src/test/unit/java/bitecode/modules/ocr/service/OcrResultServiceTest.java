package bitecode.modules.ocr.service;

import bitecode.modules.ocr.model.data.OcrResultDetails;
import bitecode.modules.ocr.model.data.RunOcrResponse;
import bitecode.modules.ocr.model.entity.OcrProviderConfig;
import bitecode.modules.ocr.model.entity.OcrResult;
import bitecode.modules.ocr.model.enums.OcrProviderType;
import bitecode.modules.ocr.model.enums.OcrResultStatus;
import bitecode.modules.ocr.model.mapper.OcrMapper;
import bitecode.modules.ocr.model.request.RunOcrRequest;
import bitecode.modules.ocr.repository.OcrResultRepository;
import bitecode.modules.ocr.service.provider.OcrProviderAdapter;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class OcrResultServiceTest {

    @Test
    @DisplayName("Should persist successful OCR result")
    void shouldPersistSuccessfulOcrResult() {
        var ocrResultRepository = mock(OcrResultRepository.class);
        var ocrInstructionService = mock(OcrInstructionService.class);
        var ocrProviderConfigService = mock(OcrProviderConfigService.class);
        var ocrMapper = mock(OcrMapper.class);
        var providerAdapter = mock(OcrProviderAdapter.class);
        when(providerAdapter.providerType()).thenReturn(OcrProviderType.OPEN_AI);
        var service = new OcrResultService(
                ocrResultRepository,
                ocrInstructionService,
                ocrProviderConfigService,
                ocrMapper,
                List.of(providerAdapter)
        );
        var userId = UUID.randomUUID();
        var providerConfig = new OcrProviderConfig();
        providerConfig.setProvider(OcrProviderType.OPEN_AI);
        providerConfig.setApiKey("api-key");
        var file = new MockMultipartFile("file", "invoice.png", "image/png", "content".getBytes(StandardCharsets.UTF_8));
        var request = new RunOcrRequest(null, "Extract total", "Invoice", OcrProviderType.OPEN_AI);
        var resultDetails = new OcrResultDetails(UUID.randomUUID(), userId, OcrProviderType.OPEN_AI, "invoice.png", "Invoice", "Extract total", OcrResultStatus.SUCCESS, "123", null, null);
        var ocrResultCaptor = ArgumentCaptor.forClass(OcrResult.class);

        when(ocrProviderConfigService.findProviderConfigEntity(OcrProviderType.OPEN_AI)).thenReturn(Optional.of(providerConfig));
        when(providerAdapter.runOcr(any(), eq(providerConfig))).thenReturn(Mono.just(new RunOcrResponse("Total: 123", null)));
        when(ocrResultRepository.save(any(OcrResult.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ocrMapper.toOcrResultDetails(any(OcrResult.class))).thenReturn(resultDetails);

        var response = service.runOcr(userId, request, file).block();

        verify(ocrResultRepository).save(ocrResultCaptor.capture());
        assertThat(ocrResultCaptor.getValue().getStatus(), is(OcrResultStatus.SUCCESS));
        assertThat(ocrResultCaptor.getValue().getResultText(), is("Total: 123"));
        assertThat(ocrResultCaptor.getValue().getInstructionTextSnapshot(), is("Extract total"));
        assertThat(response, is(resultDetails));
    }

    @Test
    @DisplayName("Should persist error OCR result when provider call fails")
    void shouldPersistErrorOcrResultWhenProviderFails() {
        var ocrResultRepository = mock(OcrResultRepository.class);
        var ocrInstructionService = mock(OcrInstructionService.class);
        var ocrProviderConfigService = mock(OcrProviderConfigService.class);
        var ocrMapper = mock(OcrMapper.class);
        var providerAdapter = mock(OcrProviderAdapter.class);
        when(providerAdapter.providerType()).thenReturn(OcrProviderType.OPEN_AI);
        var service = new OcrResultService(
                ocrResultRepository,
                ocrInstructionService,
                ocrProviderConfigService,
                ocrMapper,
                List.of(providerAdapter)
        );
        var userId = UUID.randomUUID();
        var providerConfig = new OcrProviderConfig();
        providerConfig.setProvider(OcrProviderType.OPEN_AI);
        providerConfig.setApiKey("api-key");
        var file = new MockMultipartFile("file", "invoice.png", "image/png", "content".getBytes(StandardCharsets.UTF_8));
        var request = new RunOcrRequest(null, "Extract total", "Invoice", OcrProviderType.OPEN_AI);
        var resultDetails = new OcrResultDetails(UUID.randomUUID(), userId, OcrProviderType.OPEN_AI, "invoice.png", "Invoice", "Extract total", OcrResultStatus.ERROR, null, "boom", null);
        var ocrResultCaptor = ArgumentCaptor.forClass(OcrResult.class);

        when(ocrProviderConfigService.findProviderConfigEntity(OcrProviderType.OPEN_AI)).thenReturn(Optional.of(providerConfig));
        when(providerAdapter.runOcr(any(), eq(providerConfig))).thenReturn(Mono.error(new IllegalStateException("boom")));
        when(ocrResultRepository.save(any(OcrResult.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ocrMapper.toOcrResultDetails(any(OcrResult.class))).thenReturn(resultDetails);

        var response = service.runOcr(userId, request, file).block();

        verify(ocrResultRepository).save(ocrResultCaptor.capture());
        assertThat(ocrResultCaptor.getValue().getStatus(), is(OcrResultStatus.ERROR));
        assertThat(ocrResultCaptor.getValue().getErrorMessage(), is("boom"));
        assertThat(response, is(resultDetails));
    }
}
