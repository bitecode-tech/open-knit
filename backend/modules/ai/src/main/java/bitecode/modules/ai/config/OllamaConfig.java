package bitecode.modules.ai.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.ai.ollama.OllamaEmbeddingModel;
import org.springframework.ai.ollama.api.OllamaApi;
import org.springframework.ai.ollama.api.OllamaEmbeddingOptions;
import org.springframework.ai.ollama.management.ModelManagementOptions;
import org.springframework.ai.ollama.management.PullModelStrategy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Configuration
public class OllamaConfig {
    @Value("${SPRING_AI_OLLAMA_BASE_URL:http://localhost:11434}")
    private String baseUrl;
    @Value("${SPRING_AI_OLLAMA_AUTH_TOKEN:dummy}")
    private String authToken;
    @Value("${SPRING_AI_OLLAMA_DEFAULT_EMBEDDING_MODEL:all-minilm}")
    private String defaultEmbeddingModel;

    @Bean
    @ConditionalOnProperty(name = "SPRING_AI_OLLAMA_ENABLED", havingValue = "true")
    public OllamaApi ollamaApi() {
        var webclientBuilder = WebClient.builder()
                .baseUrl(baseUrl);
        var restClientBuilder = RestClient.builder()
                .baseUrl(baseUrl);

        if (StringUtils.isNotBlank(authToken)) {
            webclientBuilder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + authToken);
            restClientBuilder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + authToken);
        }

        return OllamaApi.builder()
                .baseUrl(baseUrl)
                .restClientBuilder(restClientBuilder)
                .webClientBuilder(webclientBuilder)
                .build();
    }

    @Bean
    @ConditionalOnProperty(name = "SPRING_AI_OLLAMA_ENABLED", havingValue = "true")
    public OllamaEmbeddingModel ollamaEmbeddingModel(OllamaApi ollamaApi) {
        return OllamaEmbeddingModel.builder()
                .modelManagementOptions(
                        ModelManagementOptions.builder()
                                .pullModelStrategy(PullModelStrategy.WHEN_MISSING)
                                .build()
                )
                .defaultOptions(
                        OllamaEmbeddingOptions.builder()
                                .model(defaultEmbeddingModel)
                                .build()
                )
                .ollamaApi(ollamaApi)
                .build();
    }
}