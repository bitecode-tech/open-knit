package bitecode.modules.ai.service;

import bitecode.modules.ai.agent.provider.VectorStoreFactory;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.entity.AiServicesProviderConfig;
import bitecode.modules.ai.model.entity.VectorDocumentRef;
import bitecode.modules.ai.repository.VectorDocumentRefRepository;
import io.micrometer.common.util.StringUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.Filter;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

import static bitecode.modules.ai.config.CaffeineCacheConfig.AI_AGENT_CACHE_NAME;

@Service
@RequiredArgsConstructor
public class AgentKnowledgeService {
    private final AiAgentService aiAgentService;
    private final VectorDocumentRefRepository docRefRepo;
    private final VectorStoreFactory vectorStoreFactory;
    private final AiServicesProviderConfigService aiServicesProviderService;
    private final TextSplitter textSplitter;

    public Page<VectorDocumentRef> getDocuments(Pageable pageable, UUID uuid) {
        return docRefRepo.findAllByAiAgentUuidAndDeleted(pageable, uuid, false);
    }

    @Transactional
    @CacheEvict(cacheNames = AI_AGENT_CACHE_NAME, key = "#uuid")
    public void addDocument(UUID uuid, String content, MultipartFile file) {
        var aiAgent = aiAgentService.findAiAgentByUuidFetchAll(uuid)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Agent not found"));
        var providerConfig = findServicesProviderConfig(aiAgent);

        var filename = StringUtils.isNotBlank(file.getOriginalFilename()) ? file.getOriginalFilename() : "Unknown";
        var documentRef = VectorDocumentRef.builder()
                .aiAgent(aiAgent)
                .documentName(filename)
                .sizeBytes(file.getSize())
                .fileExt(getFileExt(filename))
                .build();
        aiAgent.getDocuments().add(documentRef);
        docRefRepo.save(documentRef);

        var baseDocument = new Document(content);
        baseDocument.getMetadata().put("documentId", documentRef.getUuid().toString());
        baseDocument.getMetadata().put("filename", filename);

        var chunks = textSplitter.split(List.of(baseDocument));

        for (int i = 0; i < chunks.size(); i++) {
            var chunk = chunks.get(i);
            chunk.getMetadata().put("documentId", documentRef.getUuid().toString());
            chunk.getMetadata().put("filename", filename);
            chunk.getMetadata().put("chunkIndex", i);
            chunk.getMetadata().put("chunkCount", chunks.size());
        }

        vectorStoreFactory.buildVectorStore(providerConfig).add(chunks);
    }

    @Transactional
    @CacheEvict(cacheNames = AI_AGENT_CACHE_NAME, key = "#uuid")
    public void updateDocuments(UUID uuid, List<UUID> remainingDocumentsIds) {
        var aiAgent = aiAgentService.findAiAgentByUuidFetchAll(uuid)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Agent not found"));
        var providerConfig = findServicesProviderConfig(aiAgent);

        var existingDocuments = docRefRepo.findAllByAiAgentUuidAndDeletedFalse(uuid);

        var toDelete = existingDocuments.stream()
                .map(VectorDocumentRef::getUuid)
                .filter(id -> !remainingDocumentsIds.contains(id))
                .toList();

        VectorStore vectorStore = null;

        for (var toDeleteUuid : toDelete) {
            if (vectorStore == null) {
                vectorStore = vectorStoreFactory.buildVectorStore(providerConfig);
            }
            var documentRef = existingDocuments.stream()
                    .filter(doc -> doc.getUuid().equals(toDeleteUuid))
                    .findFirst()
                    .orElseThrow();

            var filter = documentLookupFilter(documentRef);
            vectorStore.delete(filter);
            documentRef.setDeleted(true);
        }
    }

    @Transactional
    @CacheEvict(cacheNames = AI_AGENT_CACHE_NAME, key = "#agentId")
    public void removeDocument(UUID agentId, UUID documentId) {
        var aiAgent = aiAgentService.findAiAgentByUuidFetchAll(agentId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Agent not found"));
        var providerConfig = findServicesProviderConfig(aiAgent);

        if (aiAgentService.getAgentStrategyByName(aiAgent) == null) {
            throw new HttpClientErrorException(HttpStatus.NOT_FOUND, "Missing strategy");
        }

        var documentRef = docRefRepo.findByUuidAndDeleted(documentId, false)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Document not found"));
        var filter = documentLookupFilter(documentRef);

        vectorStoreFactory.buildVectorStore(providerConfig)
                .delete(filter);
        documentRef.setDeleted(true);
    }

    private static Filter.Expression documentLookupFilter(VectorDocumentRef documentRef) {
        return new FilterExpressionBuilder()
                .eq("metadata.documentId", documentRef.getUuid().toString())
                .build();
    }

    private AiServicesProviderConfig findServicesProviderConfig(AiAgent aiAgent) {
        return aiServicesProviderService.findProvider(aiAgent.getProvider())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "AI Services config provider not found"));
    }

    private static String getFileExt(String filename) {
        var split = filename.split("\\.");
        if (split.length > 1) {
            return split[split.length - 1];
        }
        return "File";
    }
}