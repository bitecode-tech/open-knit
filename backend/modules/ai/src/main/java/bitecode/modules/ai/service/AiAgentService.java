package bitecode.modules.ai.service;

import bitecode.modules.ai.agent.AiAgentStrategy;
import bitecode.modules.ai.agent.UserConfigurableAgentStrategy;
import bitecode.modules.ai.model.UpdateAiAgentConfigRequest;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.entity.AiAgentExemplaryPrompt;
import bitecode.modules.ai.model.enums.AiChatUi;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import bitecode.modules.ai.repository.AiAgentRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.HttpClientErrorException;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import static bitecode.modules._common.util.RandomCodeGeneratorUtils.generatePin;
import static bitecode.modules.ai.config.CaffeineCacheConfig.AI_AGENT_CACHE_NAME;

@Service
@RequiredArgsConstructor
public class AiAgentService {
    private final AiAgentRepository repository;
    private AiAgentService self; // use if you want cache to work properly
    private Map<String, AiAgentStrategy> agentStrategies;

    @Transactional(readOnly = true)
    public Page<AiAgent> findAllFetchAll(Pageable pageable) {
        var page = repository.findAllByDeletedFalse(pageable);
        page.getContent().forEach(agent -> {
            Hibernate.initialize(agent.getDocuments());
            Hibernate.initialize(agent.getExemplaryPrompts());
        });
        return page;
    }

    @Cacheable(cacheNames = AI_AGENT_CACHE_NAME, key = "#uuid", unless = "#result.empty")
    public Optional<AiAgent> findAiAgentByUuidFetchAll(UUID uuid) {
        return repository.findByUuidFetchNonDeletedDocsAndDeletedFalse(uuid)
                .map(aiAgent -> {
                    Hibernate.initialize(aiAgent.getExemplaryPrompts());
                    return aiAgent;
                });
    }

    @Transactional
    @CachePut(cacheNames = AI_AGENT_CACHE_NAME, key = "#uuid")
    public AiAgent updateAgentConfig(UUID uuid, UpdateAiAgentConfigRequest request) {
        var agent = self.findAiAgentByUuidFetchAll(uuid)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));

        request.name().ifPresent(agent::setName);
        request.title().ifPresent(agent::setTitle);
        request.systemMessage().ifPresent(agent::setSystemMessage);
        request.inputPlaceholder().ifPresent(agent::setInputPlaceholder);
        request.model().ifPresent(agent::setModel);
        request.visionModel().ifPresent(agent::setVisionModel);
        request.recordingModel().ifPresent(agent::setRecordingModel);
        request.testMode().ifPresent(agent::setTestMode);
        request.accessPassword().ifPresent(agent::setAccessPassword);
        request.accessPasswordEnabled().ifPresent(agent::setAccessPasswordEnabled);
        request.provider().ifPresent(agent::setProvider);
        request.temperature().ifPresent(agent::setTemperature);
        request.topP().ifPresent(agent::setTopP);
        request.maxTokens().ifPresent(agent::setMaxTokens);
        request.presencePenalty().ifPresent(agent::setPresencePenalty);
        request.frequencyPenalty().ifPresent(agent::setFrequencyPenalty);
        request.shortTermMemoryLastMessages().ifPresent(agent::setShortTermMemoryLastMessages);
        request.fileUploadEnabled().ifPresent(agent::setFileUploadEnabled);
        request.recordingEnabled().ifPresent(agent::setRecordingEnabled);
        request.chatUi().ifPresent(agent::setChatUi);
        request.chatkitWorkflowId().ifPresent(agent::setChatkitWorkflowId);

        if (request.exemplaryPrompts().isPresent()) {
            var exemplaryPromptsList = agent.getExemplaryPrompts();
            exemplaryPromptsList.clear();
            var reqPrompts = request.exemplaryPrompts().get();
            if (!CollectionUtils.isEmpty(reqPrompts)) {
                reqPrompts.stream()
                        .filter(StringUtils::isNotBlank)
                        .map(exemplaryPrompt -> AiAgentExemplaryPrompt.builder()
                                .prompt(exemplaryPrompt)
                                .aiAgent(agent)
                                .build()
                        )
                        .forEach(exemplaryPromptsList::add);
            }
        }

        return repository.save(agent);
    }

    @Transactional
    public AiAgent createAgent() {
        var agent = AiAgent.builder()
                .name("Agent " + generatePin(4))
                .strategyName(UserConfigurableAgentStrategy.NAME)
                .provider(AiServicesProviderType.OPEN_AI)
                .model("gpt-5-chat-latest")
                .visionModel("gpt-5-chat-latest")
                .recordingModel("gpt-5-chat-latest")
                .shortTermMemoryLastMessages(20)
                .chatUi(AiChatUi.DEFAULT)
                .build();
        return repository.save(agent);
    }

    @Transactional
    @CacheEvict(cacheNames = AI_AGENT_CACHE_NAME, key = "#uuid")
    public void deleteAgent(UUID uuid) {
        var agent = self.findAiAgentByUuidFetchAll(uuid)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
        agent.setName(agent.getName() + " (DELETED)");
        agent.setDeleted(true);
        repository.save(agent);
    }

    public AiAgentStrategy getAgentStrategyByName(AiAgent aiAgent) {
        var agentStrategy = agentStrategies.get(aiAgent.getStrategyName());
        if (agentStrategy == null) {
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND);
        }
        return agentStrategy;
    }

    public boolean requiresPassword(AiAgent aiAgent) {
        return aiAgent.getAccessPasswordEnabled();
    }

    public boolean isCorrectPassword(AiAgent aiAgent, String password) {
        return Objects.equals(password, aiAgent.getAccessPassword());
    }

    @Autowired
    public void setAgentStrategies(List<AiAgentStrategy> agents) {
        this.agentStrategies = agents.stream().collect(Collectors.toMap(AiAgentStrategy::name, Function.identity()));
    }

    @Autowired
    public void setSelf(@Lazy AiAgentService self) {
        this.self = self;
    }
}
