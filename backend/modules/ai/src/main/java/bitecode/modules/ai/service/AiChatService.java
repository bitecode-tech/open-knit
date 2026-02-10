package bitecode.modules.ai.service;

import bitecode.modules.ai.agent.LoggingAiExtension;
import bitecode.modules.ai.agent.StreamingAiAgentStrategy;
import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.model.data.projection.AgentChatSession;
import bitecode.modules.ai.model.data.projection.AiAgentSessionStats;
import bitecode.modules.ai.model.data.projection.AiAgentSessionsStats;
import bitecode.modules.ai.model.data.projection.ChatSessionWithUserMessageCount;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.entity.ChatSession;
import bitecode.modules.ai.model.entity.ChatSessionMessage;
import bitecode.modules.ai.model.enums.ChatMessageUserType;
import bitecode.modules.ai.repository.ChatSessionMessageRepository;
import bitecode.modules.ai.repository.ChatSessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;

import static bitecode.modules._common.util.RandomCodeGeneratorUtils.generatePin;


@Service
@Slf4j
@RequiredArgsConstructor
public class AiChatService {
    private final ChatSessionRepository sessionRepository;
    private final ChatSessionMessageRepository sessionMessageRepository;
    private final AiAgentService aiAgentService;
    private final FileDataExtractorService fileDataExtractorService;

    public AiAgentChatResponseData message(String externalSessionId,
                                           UUID agentId,
                                           @Nullable UUID userId,
                                           AiAgentRequestData requestData,
                                           @Nullable List<MultipartFile> attachments) {
        var aiAgent = aiAgentService.findAiAgentByUuidFetchAll(agentId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));

        if (aiAgent.getTestMode()) {
            return AiAgentChatResponseData.builder().message("Test response message " + generatePin(4)).build();
        }

        validateAttachments(aiAgent, attachments);
        requestData.setRawAttachments(attachments);
        requestData.setExternalSessionId(externalSessionId);
        requestData.setUserId(userId);

        var agentStrategy = aiAgentService.getAgentStrategyByName(aiAgent);
        var shouldLog = agentStrategy instanceof LoggingAiExtension loggingAi && loggingAi.shouldLog();


        if (shouldLog) {
            logSession(externalSessionId, requestData.getMessage(), agentId, userId, ChatMessageUserType.USER);
        }

        var responseContent = agentStrategy.message(aiAgent, requestData);

        if (shouldLog) {
            logSession(externalSessionId, responseContent.getMessage(), agentId, userId, ChatMessageUserType.AGENT);
        }

        return responseContent;
    }


    public Flux<ServerSentEvent<String>> streamMessage(String externalSessionId,
                                                       UUID agentId,
                                                       @Nullable UUID userId,
                                                       AiAgentRequestData requestData,
                                                       @Nullable List<MultipartFile> attachments) {
        var aiAgent = aiAgentService.findAiAgentByUuidFetchAll(agentId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));

        if (aiAgent.getTestMode()) {
            return Flux.fromStream(Stream.of("Test", " response", " message ", String.valueOf(generatePin(4))))
                    .map(string -> ServerSentEvent.<String>builder().data(string).build());
        }

        validateAttachments(aiAgent, attachments);
        requestData.setRawAttachments(attachments);
        requestData.setExternalSessionId(externalSessionId);
        requestData.setUserId(userId);

        var agentStrategy = aiAgentService.getAgentStrategyByName(aiAgent);
        var shouldLog = agentStrategy instanceof LoggingAiExtension loggingAi && loggingAi.shouldLog();


        if (shouldLog) {
            logSession(externalSessionId, requestData.getMessage(), agentId, userId, ChatMessageUserType.USER);
        }

        if (!(agentStrategy instanceof StreamingAiAgentStrategy streamingStrategy)) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Streaming not supported for this agent");
        }

        final StringBuffer lastSnapshot = new StringBuffer();

        var streamResponse = streamingStrategy.streamMessages(aiAgent, requestData);

        return streamResponse.mapNotNull(messageChunk -> {
                    if (messageChunk == null || messageChunk.isEmpty()) {
                        return null;
                    }

                    lastSnapshot.append(messageChunk);

                    String preservedOut = Base64.getEncoder()
                            .encodeToString(messageChunk.getBytes(StandardCharsets.UTF_8));

                    return ServerSentEvent.<String>builder()
                            .data(preservedOut)
                            .build();
                })
                .concatWith(Flux.defer(() -> {
                    var logMono = shouldLog
                            ? Mono.fromRunnable(() -> logSession(externalSessionId, lastSnapshot.toString(), agentId, userId, ChatMessageUserType.AGENT))
                            : Mono.empty();

                    return logMono.thenMany(Mono.just(ServerSentEvent.builder("\n").build()).flux());
                }));
    }

    public Page<ChatSessionWithUserMessageCount> getChatSessions(UUID agentId, Instant statDate, Instant endDate, Pageable pageable) {
        return sessionRepository.findByAgentIdAndCreatedDateBetween(agentId, statDate, endDate, pageable);
    }

    public Page<AiAgentSessionsStats> getAiAgentSessionsStats(Instant statDate, Instant endDate, String name, Pageable pageable) {
        return sessionRepository.findAgentSessionsStats(name, statDate, endDate, pageable);
    }

    public Optional<AiAgentSessionStats> getAiAgentSessionStats(Long id, Instant startDate, Instant endDate) {
        return sessionRepository.findAgentSessionStatsBySessionId(id, startDate, endDate);
    }

    public Page<ChatSessionMessage> findChatSessionMessages(UUID sessionId, Pageable pageable) {
        return sessionMessageRepository.findAllBySessionUuid(sessionId, pageable);
    }

    public String transcribeRecording(UUID agentId, @Nullable MultipartFile recording) {
        if (recording == null || recording.isEmpty()) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Recording file is required");
        }

        if (!isAudioFile(recording)) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Unsupported recording format");
        }

        var aiAgent = aiAgentService.findAiAgentByUuidFetchAll(agentId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));

        if (!Boolean.TRUE.equals(aiAgent.getRecordingEnabled())) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Voice recordings are disabled for this agent");
        }

        var attachmentContents = fileDataExtractorService.extractAttachmentContents(List.of(recording), aiAgent, false);

        return attachmentContents.stream()
                .filter(attachment -> attachment instanceof AiAgentRequestData.ExtractedAttachment)
                .map(attachment -> (AiAgentRequestData.ExtractedAttachment) attachment)
                .map(AiAgentRequestData.ExtractedAttachment::getContent)
                .filter(StringUtils::isNotBlank)
                .findFirst()
                .orElse("");
    }

    public Page<AgentChatSession> getAgentChatSessions(UUID agentId, Instant startDate, Instant endDate, Pageable pageable) {
        return sessionRepository.findAgentChatSessions(agentId, startDate, endDate, pageable);
    }

    private void validateAttachments(AiAgent aiAgent, @Nullable List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return;
        }

        if (Boolean.TRUE.equals(aiAgent.getFileUploadEnabled())) {
            return;
        }

        if (!Boolean.TRUE.equals(aiAgent.getRecordingEnabled())) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "File uploads are disabled for this agent");
        }

        boolean allAudio = attachments.stream().allMatch(this::isAudioFile);
        if (!allAudio) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "File uploads are disabled for this agent");
        }
    }

    private boolean isAudioFile(@Nullable MultipartFile file) {
        if (file == null) {
            return false;
        }
        var contentType = file.getContentType();
        return contentType != null && contentType.toLowerCase().startsWith("audio/");
    }

    private void logSession(String externalSessionId, String message, UUID agentId, @Nullable UUID userId, ChatMessageUserType userType) {
        var session = ensureSession(externalSessionId, agentId, userId);
        var sessionMessage = ChatSessionMessage.builder()
                .message(message)
                .type(userType)
                .externalSessionId(session.getExternalSessionId())
                .build();
        sessionMessageRepository.save(sessionMessage);
    }


    public ChatSession ensureSession(String externalSessionId, UUID agentId, @Nullable UUID userId) {
        return sessionRepository.findByExternalSessionId(externalSessionId)
                .orElseGet(() -> sessionRepository.save(ChatSession.builder()
                        .externalSessionId(externalSessionId)
                        .agentId(agentId)
                        .userId(userId)
                        .build()));
    }

    private void clearLastResponseId(ChatSession session) {
        if (session.getLastResponseId() != null) {
            session.setLastResponseId(null);
            sessionRepository.save(session);
        }
    }

}
