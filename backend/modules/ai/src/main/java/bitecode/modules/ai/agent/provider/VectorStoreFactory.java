package bitecode.modules.ai.agent.provider;

import bitecode.modules.ai.model.entity.AiServicesProviderConfig;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import bitecode.modules.ai.service.AiServicesProviderConfigService;
import com.azure.ai.openai.OpenAIClient;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.azure.openai.AzureOpenAiEmbeddingModel;
import org.springframework.ai.azure.openai.AzureOpenAiEmbeddingOptions;
import org.springframework.ai.document.MetadataMode;
import org.springframework.ai.ollama.OllamaEmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingModel;
import org.springframework.ai.openai.OpenAiEmbeddingOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;

@Component
@RequiredArgsConstructor
public class VectorStoreFactory {
    @Value("${STUB_ALWAYS_GPT_5_CHAT:false}")
    private Boolean stubAlwaysGpt5Mini;

    private final JdbcTemplate jdbcTemplate;
    @Nullable
    private final OllamaEmbeddingModel ollamaEmbeddingModel;
    @Nullable
    private final OpenAIClient azureOpenAiClient;
    private final AiServicesProviderConfigService providerConfigService;

    public VectorStore buildVectorStore(AiServicesProviderConfig providerConfig) {
        if (stubAlwaysGpt5Mini) {
            providerConfig = providerConfigService.findProvider(AiServicesProviderType.OPEN_AI).get();
        }
        var dimensions = 768;

        var embeddingModel = switch (providerConfig.getProvider()) {
            case OLLAMA -> ollamaEmbeddingModel;
            case OPEN_AI -> {
                var openAiApi = OpenAiApi.builder().apiKey(providerConfig.getApiKey()).build();
                yield new OpenAiEmbeddingModel(openAiApi, MetadataMode.EMBED, OpenAiEmbeddingOptions.builder()
                        .dimensions(dimensions)
                        .model("text-embedding-3-small")
                        .build()
                );
            }
            case AZURE_AI_FOUNDRY -> new AzureOpenAiEmbeddingModel(azureOpenAiClient, MetadataMode.EMBED,
                    AzureOpenAiEmbeddingOptions.builder()
                            .dimensions(768)
                            .deploymentName("text-embedding-3-small")
                            .build());
            case null, default -> throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not build vector store for given provider config=" + providerConfig);
        };

        return PgVectorStore.builder(jdbcTemplate, embeddingModel)
                .vectorTableName("vector_document_store")
                .schemaName("ai")
                .initializeSchema(false)
                .vectorTableValidationsEnabled(true)
                .dimensions(768)
                .build();
    }
}