package bitecode.modules.document;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules._common.util.AuthUtils;
import bitecode.modules.document.model.data.DocumentContent;
import bitecode.modules.document.model.data.DocumentDetails;
import bitecode.modules.document.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@RestController
@AdminAccess
@RequiredArgsConstructor
@RequestMapping("/api/admin/documents")
public class AdminDocumentController {
    private final DocumentService documentService;

    @GetMapping
    public PagedModel<DocumentDetails> getDocuments(Pageable pageable) {
        return new PagedModel<>(documentService.findAllDocuments(pageable));
    }

    @GetMapping("/{documentId}")
    public DocumentDetails getDocument(@PathVariable UUID documentId) {
        return documentService.findDocumentAsAdmin(documentId);
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable UUID documentId) {
        return buildDownloadResponse(documentService.downloadDocumentAsAdmin(documentId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<DocumentDetails>> uploadDocuments(@RequestPart("files") List<MultipartFile> files) {
        return ResponseEntity.status(201).body(documentService.uploadDocuments(AuthUtils.getUserId(), files));
    }

    @DeleteMapping("/{documentId}")
    public void deleteDocument(@PathVariable UUID documentId) {
        documentService.deleteDocumentAsAdmin(documentId);
    }

    private ResponseEntity<byte[]> buildDownloadResponse(DocumentContent documentContent) {
        var mediaType = resolveMediaType(documentContent.fileType());
        var inlineDisposition = MediaType.APPLICATION_PDF.includes(mediaType);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.builder(inlineDisposition ? "inline" : "attachment")
                        .filename(documentContent.filename(), StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .contentType(mediaType)
                .contentLength(documentContent.fileSize())
                .body(documentContent.content());
    }

    private MediaType resolveMediaType(String fileType) {
        if (!StringUtils.hasText(fileType)) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }

        try {
            return MediaType.parseMediaType(fileType);
        } catch (IllegalArgumentException exception) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
