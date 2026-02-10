package bitecode.modules.ai;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules.ai.model.data.request.UpdateAiServicesProviderRequest;
import bitecode.modules.ai.model.entity.AiServicesProviderConfig;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import bitecode.modules.ai.service.AiServicesProviderConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;

@Slf4j
@RestController
@AdminAccess
@RequiredArgsConstructor
@RequestMapping("/admin/ai/providers")
public class AdminAiServicesProviderConfigurationController {
    private final AiServicesProviderConfigService providersService;

    @GetMapping
    public List<AiServicesProviderConfig> getProviders() {
        return providersService.findAllProviders();
    }

    @GetMapping("/{provider}")
    public AiServicesProviderConfig getProvider(@PathVariable AiServicesProviderType provider) {
        return providersService.findProvider(provider)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
    }

    @PatchMapping
    public void updateProvider(@Valid @RequestBody UpdateAiServicesProviderRequest request) {
        providersService.updateServicesProvider(request);
    }
}