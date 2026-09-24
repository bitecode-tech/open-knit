package bitecode.modules.ocr;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules.ocr.model.data.OcrProviderConfigDetails;
import bitecode.modules.ocr.model.enums.OcrProviderType;
import bitecode.modules.ocr.model.request.UpdateOcrProviderConfigRequest;
import bitecode.modules.ocr.service.OcrProviderConfigService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@AdminAccess
@RequestMapping("/api/admin/ocr/providers")
public class AdminOcrProviderConfigController {
    private final OcrProviderConfigService ocrProviderConfigService;

    public AdminOcrProviderConfigController(OcrProviderConfigService ocrProviderConfigService) {
        this.ocrProviderConfigService = ocrProviderConfigService;
    }

    @GetMapping
    public List<OcrProviderConfigDetails> getProviders() {
        return ocrProviderConfigService.findAllProviderConfigs();
    }

    @GetMapping("/{provider}")
    public OcrProviderConfigDetails getProvider(@PathVariable OcrProviderType provider) {
        return ocrProviderConfigService.findProviderConfig(provider);
    }

    @PatchMapping
    public OcrProviderConfigDetails updateProvider(@Valid @RequestBody UpdateOcrProviderConfigRequest request) {
        return ocrProviderConfigService.updateProviderConfig(request);
    }
}
