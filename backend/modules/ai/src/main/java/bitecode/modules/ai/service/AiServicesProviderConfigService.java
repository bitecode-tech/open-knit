package bitecode.modules.ai.service;

import bitecode.modules.ai.model.data.request.UpdateAiServicesProviderRequest;
import bitecode.modules.ai.model.entity.AiServicesProviderConfig;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import bitecode.modules.ai.repository.AiServicesProviderConfigRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

import static bitecode.modules.ai.config.CaffeineCacheConfig.AI_PROVIDER_CONFIG_CACHE_NAME;

@Service
@RequiredArgsConstructor
public class AiServicesProviderConfigService {
    private final AiServicesProviderConfigRepository repository;
    private AiServicesProviderConfigService self; // ensure cache works on self-invocation

    @PostConstruct
    public void init() {
        var existingProviders = findAllProviders().stream()
                .collect(Collectors.toMap(AiServicesProviderConfig::getProvider, Function.identity()));
        for (var provider : AiServicesProviderType.values()) {
            if (existingProviders.get(provider) == null) {
                var initial = AiServicesProviderConfig.builder()
                        .provider(provider)
                        .build();
                repository.save(initial);
            }
        }
    }

    @Cacheable(cacheNames = AI_PROVIDER_CONFIG_CACHE_NAME, key = "#provider", unless = "#result.empty")
    public Optional<AiServicesProviderConfig> findProvider(AiServicesProviderType provider) {
        return repository.findByProvider(provider);
    }

    public List<AiServicesProviderConfig> findAllProviders() {
        return repository.findAll();
    }

    @Transactional
    @CachePut(cacheNames = AI_PROVIDER_CONFIG_CACHE_NAME, key = "#request.provider")
    public AiServicesProviderConfig updateServicesProvider(UpdateAiServicesProviderRequest request) {
        var providerConfig = self.findProvider(request.getProvider())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Provider not found"));
        providerConfig.setApiKey(request.getApiKey());
        return repository.save(providerConfig);
    }

    @Autowired
    public void setSelf(@Lazy AiServicesProviderConfigService self) {
        this.self = self;
    }
}
