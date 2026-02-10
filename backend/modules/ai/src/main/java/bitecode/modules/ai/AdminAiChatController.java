package bitecode.modules.ai;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules._common.util.AuthUtils;
import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.agent.data.AudioTranscriptionResponse;
import bitecode.modules.ai.model.data.details.ChatSessionMessageDetails;
import bitecode.modules.ai.model.data.details.ChatSessionWithCountDetails;
import bitecode.modules.ai.model.data.projection.AgentChatSession;
import bitecode.modules.ai.model.data.projection.AiAgentSessionStats;
import bitecode.modules.ai.model.data.projection.AiAgentSessionsStats;
import bitecode.modules.ai.model.mapper.ChatSessionMapper;
import bitecode.modules.ai.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@AdminAccess
@RequestMapping("/admin/ai/agents")
@RequiredArgsConstructor
public class AdminAiChatController {
    private final AiChatService aiChatService;
    private final ChatSessionMapper chatSessionMapper;

    @PostMapping(value = "/{uuid}/chat", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AiAgentChatResponseData chat(@RequestParam String prompt,
                                        @RequestParam String sessionId,
                                        @PathVariable UUID uuid,
                                        @RequestPart(name = "files", required = false) List<MultipartFile> attachments) {
        var requestData = AiAgentRequestData.builder().message(prompt).build();
        return aiChatService.message(sessionId, uuid, AuthUtils.getUserId(), requestData, attachments);
    }

    @PostMapping(value = "/{uuid}/chat/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AudioTranscriptionResponse transcribeRecording(@PathVariable UUID uuid,
                                                          @RequestPart("recording") MultipartFile recording) {
        var transcript = aiChatService.transcribeRecording(uuid, recording);
        return new AudioTranscriptionResponse(transcript);
    }

    @GetMapping("/{agentId}/sessions")
    public PagedModel<AgentChatSession> getAgentChatSessions(@PathVariable UUID agentId,
                                                             @RequestParam(required = false) Instant statDate,
                                                             @RequestParam(required = false) Instant endDate,
                                                             Pageable pageable) {
        return new PagedModel<>(aiChatService.getAgentChatSessions(agentId, statDate, endDate, pageable));
    }

    @GetMapping("/sessions")
    public PagedModel<ChatSessionWithCountDetails> getSessions(@RequestParam UUID uuid, @RequestParam Instant statDate, @RequestParam Instant endDate, Pageable pageable) {
        return new PagedModel<>(
                aiChatService.getChatSessions(uuid, statDate, endDate, pageable)
                        .map(chatSessionMapper::toDetails)
        );
    }

    @GetMapping("/sessions/stats")
    public PagedModel<AiAgentSessionsStats> getAiAgentSessionsStats(@RequestParam Instant startDate,
                                                                    @RequestParam Instant endDate,
                                                                    @RequestParam(required = false) String name,
                                                                    Pageable pageable) {
        return new PagedModel<>(aiChatService.getAiAgentSessionsStats(startDate, endDate, name, pageable));
    }

    @GetMapping("/sessions/{id}/stats")
    public AiAgentSessionStats getAiAgentSessionStats(@PathVariable String id,
                                                      @RequestParam(required = false) Instant startDate,
                                                      @RequestParam(required = false) Instant endDate) {
        // one off with Long id, if needed include uuid
        return aiChatService.getAiAgentSessionStats(Long.valueOf(id), startDate, endDate)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    public PagedModel<ChatSessionMessageDetails> getChatSessionMessages(@PathVariable UUID sessionId, Pageable pageable) {
        return new PagedModel<>(aiChatService.findChatSessionMessages(sessionId, pageable).map(chatSessionMapper::toDetails));
    }
} 
