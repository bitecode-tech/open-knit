package bitecode.modules.ai;

import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.agent.data.AudioTranscriptionResponse;
import bitecode.modules.ai.model.data.NoAuthAiAgentDetails;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.mapper.AiAgentMapper;
import bitecode.modules.ai.service.AiAgentService;
import bitecode.modules.ai.service.AiChatService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.UUID;

@RestController
@PermitAll
@RequestMapping("/open/ai/agents")
@RequiredArgsConstructor
public class OpenAiAgentController {
    private final AiChatService aiChatService;
    private final AiAgentService aiAgentService;
    private final AiAgentMapper aiAgentMapper;

    @PostMapping("/{uuid}/password-check")
    @RateLimiter(name = "ai-chat-open")
    public void validateAgentPassword(@PathVariable UUID uuid, @RequestParam String password) {
        passwordCheck(uuid, password);
    }

    @GetMapping("/{uuid}")
    @RateLimiter(name = "ai-chat-open")
    public NoAuthAiAgentDetails getAgent(@PathVariable UUID uuid, @RequestParam(required = false) String password) {
        var agent = passwordCheck(uuid, password);
        return aiAgentMapper.toDetails(agent);
    }

    @PostMapping(value = "/{uuid}/chat", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RateLimiter(name = "ai-chat-open")
    public ResponseEntity<AiAgentChatResponseData> chat(@RequestParam String prompt,
                                                        @RequestParam String sessionId,
                                                        @PathVariable UUID uuid,
                                                        @RequestParam(required = false) String password,
                                                        @RequestPart(name = "files", required = false) List<MultipartFile> attachments) {
        var requestData = AiAgentRequestData.builder().message(prompt).build();
        passwordCheck(uuid, password);
        return ResponseEntity.ok(aiChatService.message(sessionId, uuid, null, requestData, attachments));
    }

    @PostMapping(value = "/{uuid}/chat/stream", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @RateLimiter(name = "ai-chat-open")
    public Flux<ServerSentEvent<String>> chatStream(@RequestParam String prompt,
                                                    @RequestParam String sessionId,
                                                    @PathVariable UUID uuid,
                                                    @RequestParam(required = false) String password,
                                                    @RequestPart(name = "files", required = false) List<MultipartFile> attachments) {
        var requestData = AiAgentRequestData.builder().message(prompt).build();
        passwordCheck(uuid, password);
        return aiChatService.streamMessage(sessionId, uuid, null, requestData, attachments);
    }

    @PostMapping(value = "/{uuid}/chat/transcribe", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @RateLimiter(name = "ai-chat-open")
    public AudioTranscriptionResponse transcribeRecording(@PathVariable UUID uuid,
                                                          @RequestParam(required = false) String password,
                                                          @RequestPart("recording") MultipartFile recording) {
        passwordCheck(uuid, password);
        var transcript = aiChatService.transcribeRecording(uuid, recording);
        return new AudioTranscriptionResponse(transcript);
    }

    private AiAgent passwordCheck(UUID uuid, String password) {
        var agent = aiAgentService.findAiAgentByUuidFetchAll(uuid)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));

        if (aiAgentService.requiresPassword(agent) && !aiAgentService.isCorrectPassword(agent, password)) {
            throw new HttpClientErrorException(HttpStatus.UNAUTHORIZED, "Incorrect password");
        }
        return agent;
    }
} 
