package bitecode.modules.document.service;

import bitecode.modules.document.config.properties.DocumentProperties;
import bitecode.modules.document.model.data.DocumentDownload;
import bitecode.modules.document.model.data.DocumentDetails;
import bitecode.modules.document.model.entity.Document;
import bitecode.modules.document.model.enums.DocumentStorageType;
import bitecode.modules.document.model.mapper.DocumentMapper;
import bitecode.modules.document.repository.DocumentRepository;
import bitecode.modules.document.service.storage.DocumentStorageAdapter;
import bitecode.modules.document.service.storage.StoreDocumentRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.DigestInputStream;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class DocumentService {
    private static final String CHECKSUM_ALGORITHM = "SHA-256";

    private final DocumentRepository documentRepository;
    private final DocumentMapper documentMapper;
    private final DocumentProperties documentProperties;
    private final Map<DocumentStorageType, DocumentStorageAdapter> storageAdaptersByType;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentMapper documentMapper,
                           DocumentProperties documentProperties,
                           List<DocumentStorageAdapter> documentStorageAdapters) {
        this.documentRepository = documentRepository;
        this.documentMapper = documentMapper;
        this.documentProperties = documentProperties;
        this.storageAdaptersByType = new EnumMap<>(DocumentStorageType.class);
        for (var documentStorageAdapter : documentStorageAdapters) {
            this.storageAdaptersByType.put(documentStorageAdapter.storageType(), documentStorageAdapter);
        }
    }

    @Transactional(readOnly = true)
    public Page<DocumentDetails> findAllDocuments(Pageable pageable) {
        return documentRepository.findAll(pageable)
                .map(documentMapper::toDocumentDetails);
    }

    @Transactional(readOnly = true)
    public Page<DocumentDetails> findUserDocuments(UUID userId, Pageable pageable) {
        return documentRepository.findAllByUserId(userId, pageable)
                .map(documentMapper::toDocumentDetails);
    }

    @Transactional(readOnly = true)
    public DocumentDetails findDocumentAsAdmin(UUID documentId) {
        return documentMapper.toDocumentDetails(resolveDocumentAsAdmin(documentId));
    }

    @Transactional(readOnly = true)
    public DocumentDetails findDocumentForUser(UUID documentId, UUID userId) {
        return documentMapper.toDocumentDetails(resolveDocumentForUser(documentId, userId));
    }

    @Transactional
    public List<DocumentDetails> uploadDocuments(UUID userId, List<MultipartFile> files) {
        validateFiles(files);
        var uploadedDocuments = new ArrayList<DocumentDetails>();

        for (var file : files) {
            uploadedDocuments.add(uploadSingleDocument(userId, file));
        }

        return uploadedDocuments;
    }

    @Transactional
    public void deleteDocumentAsAdmin(UUID documentId) {
        deleteDocument(resolveDocumentAsAdmin(documentId));
    }

    @Transactional
    public void deleteDocumentForUser(UUID documentId, UUID userId) {
        deleteDocument(resolveDocumentForUser(documentId, userId));
    }

    @Transactional(readOnly = true)
    public DocumentDownload downloadDocumentAsAdmin(UUID documentId) {
        return toDocumentDownload(resolveDocumentAsAdmin(documentId));
    }

    @Transactional(readOnly = true)
    public DocumentDownload downloadDocumentForUser(UUID documentId, UUID userId) {
        return toDocumentDownload(resolveDocumentForUser(documentId, userId));
    }

    public void copyDocumentToStream(DocumentDownload documentDownload, OutputStream destination) {
        resolveStorageAdapter(documentDownload.storageType())
                .copyToStream(documentDownload.ownerUserId(), documentDownload.storedFilename(), destination);
    }

    private DocumentDetails uploadSingleDocument(UUID userId, MultipartFile file) {
        var originalFilename = extractOriginalFilename(file);
        var messageDigest = createMessageDigest();
        Path stagedFile;
        try {
            stagedFile = Files.createTempFile("document-upload-", ".tmp");
        } catch (IOException exception) {
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to prepare uploaded file");
        }

        try {
            long fileSize;
            try (var inputStream = new DigestInputStream(file.getInputStream(), messageDigest)) {
                fileSize = Files.copy(inputStream, stagedFile, StandardCopyOption.REPLACE_EXISTING);
            }
            var storageType = documentProperties.getDefaultStorageType();
            var document = new Document();

            document.setUserId(userId);
            document.setFilename(originalFilename);
            document.setStoredFilename(originalFilename + "-" + document.getUuid());
            document.setChecksum(HexFormat.of().formatHex(messageDigest.digest()));
            document.setFileSize(fileSize);
            document.setFileType(resolveFileType(file));
            document.setStorageType(storageType);

            var storeDocumentRequest = new StoreDocumentRequest(document.getUserId(), document.getStoredFilename(), new byte[0]);
            var storageAdapter = resolveStorageAdapter(storageType);
            storageAdapter.storeFile(document.getUserId(), document.getStoredFilename(), stagedFile, fileSize);

            try {
                return documentMapper.toDocumentDetails(documentRepository.save(document));
            } catch (RuntimeException exception) {
                try {
                    storageAdapter.delete(storeDocumentRequest);
                } catch (RuntimeException deleteException) {
                    log.error("Failed to rollback stored document after DB error, userId={}, storedFilename={}", userId, document.getStoredFilename(), deleteException);
                }
                throw exception;
            }
        } catch (IOException exception) {
            throw new HttpClientErrorException(HttpStatus.NOT_ACCEPTABLE, "Failed to read uploaded file");
        } finally {
            deleteStagedFile(stagedFile);
        }
    }

    private void deleteDocument(Document document) {
        var storeDocumentRequest = new StoreDocumentRequest(document.getUserId(), document.getStoredFilename(), new byte[0]);
        resolveStorageAdapter(document.getStorageType()).delete(storeDocumentRequest);
        documentRepository.delete(document);
    }

    private DocumentDownload toDocumentDownload(Document document) {
        return new DocumentDownload(document.getFilename(), document.getFileType(), document.getFileSize(),
                document.getUserId(), document.getStoredFilename(), document.getStorageType());
    }

    private Document resolveDocumentAsAdmin(UUID documentId) {
        return documentRepository.findByUuid(documentId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
    }

    private Document resolveDocumentForUser(UUID documentId, UUID userId) {
        return documentRepository.findByUuidAndUserId(documentId, userId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
    }

    private DocumentStorageAdapter resolveStorageAdapter(DocumentStorageType storageType) {
        var storageAdapter = storageAdaptersByType.get(storageType);
        if (storageAdapter == null) {
            throw new IllegalStateException("No document storage adapter configured for type: " + storageType);
        }
        return storageAdapter;
    }

    private void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "No files provided");
        }

        for (var file : files) {
            if (file == null || file.isEmpty()) {
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Empty file upload is not allowed");
            }
        }
    }

    private String extractOriginalFilename(MultipartFile file) {
        var originalFilename = file.getOriginalFilename();
        if (!StringUtils.hasText(originalFilename)) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Filename is required");
        }

        var normalizedFilename = originalFilename.replace("\\", "/");
        normalizedFilename = normalizedFilename.substring(normalizedFilename.lastIndexOf('/') + 1);
        if (!StringUtils.hasText(normalizedFilename)) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Filename is required");
        }
        return normalizedFilename;
    }

    private MessageDigest createMessageDigest() {
        try {
            return MessageDigest.getInstance(CHECKSUM_ALGORITHM);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Checksum algorithm is not available: " + CHECKSUM_ALGORITHM, exception);
        }
    }

    private void deleteStagedFile(Path stagedFile) {
        try {
            Files.deleteIfExists(stagedFile);
        } catch (IOException exception) {
            log.warn("Failed to remove staged document upload file {}", stagedFile, exception);
        }
    }

    private String resolveFileType(MultipartFile file) {
        if (StringUtils.hasText(file.getContentType())) {
            return file.getContentType();
        }
        return MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }
}
