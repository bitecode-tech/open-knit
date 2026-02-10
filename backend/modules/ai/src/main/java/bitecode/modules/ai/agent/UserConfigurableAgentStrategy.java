package bitecode.modules.ai.agent;

import bitecode.modules.ai.agent.client.CompletionsApiMessageClient;
import bitecode.modules.ai.agent.client.ResponsesApiMessageClient;
import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.agent.data.EnrichedAiAgentRequestData;
import bitecode.modules.ai.agent.data.StreamingResponse;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.enums.AiChatUi;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import bitecode.modules.ai.repository.AiAgentRepository;
import bitecode.modules.ai.repository.ChatSessionMessageRepository;
import bitecode.modules.ai.repository.ChatSessionRepository;
import bitecode.modules.ai.service.AiChatService;
import bitecode.modules.ai.service.FileDataExtractorService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserConfigurableAgentStrategy implements AiAgentStrategy, LoggingAiExtension, StreamingAiAgentStrategy {
    public static final String NAME = "UserConfigurableAgent";
    private final AiAgentRepository aiAgentRepository;
    private final CompletionsApiMessageClient completionsApiMessageClient;
    private final ResponsesApiMessageClient responsesApiMessageClient;
    private final FileDataExtractorService fileDataExtractorService;
    private final ChatSessionMessageRepository sessionMessageRepository;
    private final ChatSessionRepository sessionRepository;
    private AiChatService aiChatService;

    @PostConstruct
    public void init() {
        if (aiAgentRepository.count() == 0) {
            var agent = AiAgent.builder()
                    .name("New AI agent")
                    .strategyName(NAME)
                    .model("gpt-5-chat-latest")
                    .visionModel("gpt-5-chat-latest")
                    .systemMessage("I'm friendly Agent...")
                    .chatUi(AiChatUi.DEFAULT)
                    .build();
            aiAgentRepository.save(agent);
        }
    }

    @Override
    public String name() {
        return NAME;
    }

    @Override
    public <T extends AiAgentRequestData> AiAgentChatResponseData message(AiAgent aiAgent, T data) {
        var isOpenAiProvider = AiServicesProviderType.OPEN_AI.equals(aiAgent.getProvider());
        data.setAttachments(fileDataExtractorService.extractAttachmentContents(data.getRawAttachments(), aiAgent, isOpenAiProvider));

        if (AiServicesProviderType.OPEN_AI.equals(aiAgent.getProvider())) {
            var enrichedData = enrichWithLastResponseId(aiAgent, data);
            var response = responsesApiMessageClient.message(aiAgent, enrichedData);
            updateLastResponseId(data, response.getPreviousResponseId());
            return response;
        }

        var enrichedData = enrichRequestWithMessageHistory(aiAgent, data);
        return completionsApiMessageClient.message(aiAgent, enrichedData);
    }

    @Override
    public boolean shouldLog() {
        return true;
    }


    @Override
    public <T extends AiAgentRequestData> Flux<String> streamMessages(AiAgent aiAgent, T data) {
        var isOpenAiProvider = AiServicesProviderType.OPEN_AI.equals(aiAgent.getProvider());
        data.setAttachments(fileDataExtractorService.extractAttachmentContents(data.getRawAttachments(), aiAgent, isOpenAiProvider));

        if (isOpenAiProvider) {
            var enrichedData = enrichWithLastResponseId(aiAgent, data);

            var messageStream = responsesApiMessageClient.streamMessages(aiAgent, enrichedData);

            return messageStream.messageChunks()
                    .doAfterTerminate(() -> updateLastResponseId(enrichedData, messageStream));
        }
        var enrichedData = enrichRequestWithMessageHistory(aiAgent, data);

        return completionsApiMessageClient.streamMessages(aiAgent, enrichedData).messageChunks();
    }

    private <T extends AiAgentRequestData> void updateLastResponseId(T data, StreamingResponse messageStream) {
        messageStream.responseId()
                .flatMap(responseId -> Mono.fromRunnable(() -> updateLastResponseId(data, responseId))
                        .subscribeOn(Schedulers.boundedElastic())
                )
                .subscribe();
    }

    private <T extends AiAgentRequestData> void updateLastResponseId(T data, String responseId) {
        sessionRepository.updateLastResponseId(
                data.getExternalSessionId(),
                data.getUserId(),
                responseId
        );
    }

    private AiAgentRequestData enrichRequestWithMessageHistory(AiAgent aiAgent, AiAgentRequestData requestData) {
        var pageable = PageRequest.of(0, aiAgent.getShortTermMemoryLastMessages(), Sort.by("createdDate").ascending());
        var messages = sessionMessageRepository.findAllByExternalSessionId(requestData.getExternalSessionId(), pageable);
        return EnrichedAiAgentRequestData.builder().messages(messages.toList()).requestData(requestData).build();
    }

    private AiAgentRequestData enrichWithLastResponseId(AiAgent aiAgent, AiAgentRequestData data) {
        var session = aiChatService.ensureSession(data.getExternalSessionId(), aiAgent.getUuid(), data.getUserId());
        return EnrichedAiAgentRequestData.builder().lastResponseId(session.getLastResponseId()).requestData(data).build();
    }

    @Autowired
    public void setAiChatService(@Lazy AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }
}
