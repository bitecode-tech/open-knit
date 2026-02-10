package bitecode.modules.ai;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules.ai.model.UpdateAiAgentConfigRequest;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.entity.VectorDocumentRef;
import bitecode.modules.ai.service.AgentKnowledgeService;
import bitecode.modules.ai.service.AiAgentService;
import bitecode.modules.ai.utils.DocumentUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@AdminAccess
@RequiredArgsConstructor
@RequestMapping("/admin/ai/agents")
public class AdminAgentConfigurationController {

    private static final List<String> ALLOWED_TYPES = List.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private final AgentKnowledgeService knowledgeService;
    private final AiAgentService aiAgentService;

    @GetMapping
    public PagedModel<AiAgent> getAgent(Pageable pageable) {
        return new PagedModel<>(aiAgentService.findAllFetchAll(pageable));
    }

    @GetMapping("/{uuid}")
    public AiAgent getAgent(@PathVariable UUID uuid) {
        return aiAgentService.findAiAgentByUuidFetchAll(uuid)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public AiAgent createAgent() {
        return aiAgentService.createAgent();
    }

    @PatchMapping("/{uuid}")
    public AiAgent updateAgent(@PathVariable UUID uuid, @RequestBody UpdateAiAgentConfigRequest request) {
        return aiAgentService.updateAgentConfig(uuid, request);
    }

    @DeleteMapping("/{uuid}")
    public void deleteAgent(@PathVariable UUID uuid) {
        aiAgentService.deleteAgent(uuid);
    }

    @PatchMapping("/{uuid}/knowledge")
    public void updateDocuments(@PathVariable UUID uuid, @RequestBody List<UUID> remainingDocumentsIds) {
        knowledgeService.updateDocuments(uuid, remainingDocumentsIds);
    }

    @GetMapping("/{uuid}/knowledge")
    public PagedModel<VectorDocumentRef> getDocuments(@PathVariable UUID uuid, Pageable pageable) {
        return new PagedModel<>(knowledgeService.getDocuments(pageable, uuid));
    }

    @PostMapping(path = "/{uuid}/knowledge", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void addDocs(@RequestParam("files") List<MultipartFile> files, @PathVariable UUID uuid) {
        for (var file : files) {
            try {
                if (!ALLOWED_TYPES.contains(file.getContentType())) {
                    throw new HttpClientErrorException(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
                }
                var content = DocumentUtils.extractText(file);
                knowledgeService.addDocument(uuid, content, file);
            } catch (IOException e) {
                log.error("Error while parsing document: {}", file.getOriginalFilename(), e);
                throw new HttpClientErrorException(HttpStatus.NOT_ACCEPTABLE);
            }
        }
    }

    @DeleteMapping("/{uuid}/knowledge/{id}")
    public void removeDoc(@PathVariable UUID uuid, @PathVariable UUID id) {
        knowledgeService.removeDocument(uuid, id);
    }
}