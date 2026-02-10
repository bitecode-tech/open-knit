package bitecode.modules.ai;

import bitecode.modules._common.model.annotation.AdminOrUserAccess;
import bitecode.modules._common.util.AuthUtils;
import bitecode.modules.ai.agent.UserConfigurableAgentStrategy;
import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@AdminOrUserAccess
@RequestMapping("/ai/agents/{uuid}/chat")
@RequiredArgsConstructor
public class UserAiChatController {
    private final AiChatService aiChatService;

    private final Set<String> availableAgents = Set.of(UserConfigurableAgentStrategy.NAME);

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiAgentChatResponseData> chat(@RequestParam String prompt,
                                                        @RequestParam String sessionId,
                                                        @PathVariable UUID uuid,
                                                        @RequestPart(name = "files", required = false) List<MultipartFile> attachments) {
        var requestData = AiAgentRequestData.builder().message(prompt).build();
        return ResponseEntity.ok(aiChatService.message(sessionId, uuid, AuthUtils.getUserId(), requestData, attachments));
    }
}
