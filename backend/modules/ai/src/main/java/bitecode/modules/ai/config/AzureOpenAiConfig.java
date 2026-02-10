package bitecode.modules.ai.config;

import bitecode.modules._common.util.UrlUtils;
import com.azure.ai.openai.OpenAIClient;
import com.azure.ai.openai.OpenAIClientBuilder;
import com.azure.identity.ClientSecretCredential;
import com.azure.identity.ClientSecretCredentialBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.core.type.AnnotatedTypeMetadata;

@Configuration
@Slf4j
public class AzureOpenAiConfig {
    @Value("${AZURE_CLIENT_ID:}")
    private String clientId;
    @Value("${AZURE_CLIENT_SECRET:}")
    private String clientSecret;
    @Value("${AZURE_TENANT_ID:}")
    private String tenantId;
    @Value("${AZURE_AI_FOUNDRY_PROJECT_ENDPOINT:}")
    private String projectEndpoint;

    @Bean
    @Conditional(AzureCredentialsPresentCondition.class)
    public ClientSecretCredential azureClientSecretCredential() {
        return new ClientSecretCredentialBuilder()
                .clientId(clientId)
                .clientSecret(clientSecret)
                .tenantId(tenantId)
                .build();
    }


    @Bean
    @Conditional(AzureCredentialsPresentCondition.class)
    public OpenAIClientBuilder azureOpenAiClientBuilder(ClientSecretCredential azureCredentials) {
        return new OpenAIClientBuilder()
                .credential(azureCredentials)
                .endpoint(UrlUtils.getBaseUrl(projectEndpoint));
    }

    @Bean
    @Conditional(AzureCredentialsPresentCondition.class)
    public OpenAIClient azureOpenAiClient(OpenAIClientBuilder builder) {
        return builder.buildClient();
    }

    public static class AzureCredentialsPresentCondition implements Condition {

        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            var clientId = context.getEnvironment().getProperty("AZURE_CLIENT_ID");
            var clientSecret = context.getEnvironment().getProperty("AZURE_CLIENT_SECRET");
            var tenantId = context.getEnvironment().getProperty("AZURE_TENANT_ID");
            var projectEndpoint = context.getEnvironment().getProperty("AZURE_AI_FOUNDRY_PROJECT_ENDPOINT");
            var matches = isNonEmpty(clientId) && isNonEmpty(clientSecret) && isNonEmpty(tenantId) && isNonEmpty(projectEndpoint);
            if (matches) {
                log.info("Azure OpenAI Foundry enabled");
            } else {
                log.warn("Azure OpenAI Foundry disabled, service principal data absent");
            }
            return matches;
        }

        private boolean isNonEmpty(String value) {
            return value != null && !value.trim().isEmpty();
        }
    }
}
