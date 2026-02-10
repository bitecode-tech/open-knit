package bitecode.modules.ai;

import bitecode.modules.ai.agent.provider.openai.SimpleOpenAiClient;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import bitecode.modules.ai.service.AiServicesProviderConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * Mints ChatKit client secrets using the OpenAI provider API key.
 * Falls back to a configured static secret if provided.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatkitSessionService {

    private final AiServicesProviderConfigService providerConfigService;

    @Value("${chatkit.client-secret:}")
    private String configuredClientSecret;
    @Value("${chatkit.workflow:wf_69320e8790108190a84072999fae0a3702eebf2c0c66a9c8}")
    private String workflowId;
    @Value("${chatkit.organization:org-GhyLoZWlBbo2jeWrZKjF57Ft}")
    private String organizationId;
    @Value("${chatkit.project:proj_Nozu583ngOTBpezk1DDGRI0J}")
    private String projectId;

    public String fetchClientSecret(String existingClientSecret, String userId, String workflowOverride) {
        if (StringUtils.hasText(configuredClientSecret)) {
            return configuredClientSecret;
        }

        var provider = providerConfigService.findProvider(AiServicesProviderType.OPEN_AI)
                .orElseThrow(() -> new IllegalStateException("OpenAI provider configuration not found"));
        if (!StringUtils.hasText(provider.getApiKey())) {
            throw new IllegalStateException("OpenAI API key is missing in provider configuration");
        }

        var resolvedWorkflowId = StringUtils.hasText(workflowOverride)
                ? workflowOverride
                : workflowId;

        if (!StringUtils.hasText(resolvedWorkflowId)) {
            throw new IllegalStateException("ChatKit workflow ID is missing (configure chatkit.workflow)");
        }

        try {
            var client = new SimpleOpenAiClient(provider.getApiKey(), organizationId, projectId);
            var secret = client.mintChatkitClientSecret(resolvedWorkflowId, userId, existingClientSecret).block();
            if (!StringUtils.hasText(secret)) {
                throw new IllegalStateException("Missing client_secret in ChatKit session response");
            }
            return secret;
        } catch (WebClientResponseException httpEx) {
            throw new IllegalStateException("Failed to mint ChatKit client secret: "
                    + httpEx.getStatusCode() + " body=" + httpEx.getResponseBodyAsString(), httpEx);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to mint ChatKit client secret", ex);
        }
    }
}
