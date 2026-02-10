package bitecode.modules.ai.service;

import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.agent.provider.ChatProviderBuilder;
import bitecode.modules.ai.agent.provider.openai.OpenAiFileApiClient;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.entity.AiServicesProviderConfig;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import bitecode.modules.ai.utils.DocumentUtils;
import com.openai.models.files.FilePurpose;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.ai.audio.transcription.AudioTranscriptionPrompt;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.content.Media;
import org.springframework.ai.openai.OpenAiAudioTranscriptionModel;
import org.springframework.ai.openai.OpenAiAudioTranscriptionOptions;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeType;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class FileDataExtractorService {
    private static final Set<String> ALLOWED_IMAGE_MIME = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif", "image/svg+xml"
    );
    private static final Set<String> ALLOWED_AUDIO_MIME = Set.of(
            "audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/ogg", "audio/webm", "audio/m4a", "audio/x-m4a", "audio/flac"
    );
    private static final Set<String> ALLOWED_PDF_MIME = Set.of(
            "application/pdf",
            "application/x-pdf",
            "application/acrobat",
            "applications/vnd.pdf",
            "text/pdf",
            "text/x-pdf"
    );
    private static final Set<String> ALLOWED_DOC_MIME = Set.of(
            "application/pdf",
            "text/plain",
            "text/markdown",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/csv",
            "application/json",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    private static final Set<String> ALLOWED_DOC_EXT = Set.of(
            "pdf", "txt", "md", "doc", "docx", "xls", "xlsx", "csv", "json", "ppt", "pptx"
    );

    private final AiServicesProviderConfigService providerConfigService;
    private final ChatProviderBuilder chatProviderBuilder;
    private final OpenAiFileApiClient openAiFileApiService;

    public List<AiAgentRequestData.AttachmentContent> extractAttachmentContents(@Nullable List<MultipartFile> files, AiAgent agent, boolean uploadFiles) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }
        return Flux.fromIterable(files)
                .filter(file -> file != null && !file.isEmpty())
                .flatMap(file -> Mono.fromCallable(() -> toAttachmentContent(file, agent, uploadFiles))
                        .subscribeOn(Schedulers.boundedElastic()), 5)
                .collectList()
                .block();
    }

    private AiAgentRequestData.AttachmentContent toAttachmentContent(MultipartFile file, AiAgent agent, boolean uploadFiles) throws IOException {
        var category = validateAttachment(file);
        var providerConfig = providerConfigService.findProvider(agent.getProvider())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Missing provider configuration"));
        var contentType = normalizeContentType(file.getContentType());
        var mimeType = toMimeType(normalizeContentType(file.getContentType()));
        var providerType = agent.getProvider();

        if (uploadFiles) {
            if (providerType.equals(AiServicesProviderType.OPEN_AI)) {
                var fileResp = openAiFileApiService.uploadFile(providerConfig, file, FilePurpose.ASSISTANTS);
                return AiAgentRequestData.UploadedAttachment.builder().fileId(fileResp.id()).build();
            } else {
                throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Upload attachment: Unsupported provider type: " + providerType);
            }
        }


        if (category == AttachmentCategory.IMAGE || category == AttachmentCategory.PDF) {
            var resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            return AiAgentRequestData.AttachableContent.builder()
                    .media(new Media(mimeType, resource))
                    .build();
        }


        var builder = AiAgentRequestData.ExtractedAttachment.builder()
                .filename(StringUtils.defaultIfBlank(file.getOriginalFilename(), "attachment"))
                .mimeType(contentType)
                .sizeBytes(file.getSize());
        try {
            String extracted = "";

            if (category == AttachmentCategory.AUDIO) {
                if (agent.getRecordingEnabled()) {
                    extracted = extractAudioContent(file, agent);
                } else {
                    log.warn("Agent recording disabled however audio file included");
                }
            } else if (category == AttachmentCategory.IMAGE) {
                if (agent.getFileUploadEnabled()) {
                    extracted = extractImageContent(file, agent, providerConfig);
                } else {
                    log.warn("Agent file upload disabled however image was included");
                }
            } else { // DOCUMENT or PDF
                if (agent.getFileUploadEnabled()) {
                    extracted = extractDocumentContent(file);
                } else {
                    log.warn("Agent file upload disabled however file was included");
                }
            }

            if (StringUtils.isBlank(extracted)) {
                builder.content("");
            } else {
                builder.content(normalizeText(extracted));
            }
        } catch (Exception ex) {
            log.warn("Failed to process attachment {}: {}", file.getOriginalFilename(), ex.getMessage());
            builder.failed(true).failureReason(summarizeFailure(ex));
        }

        return builder.build();
    }

    private String extractDocumentContent(MultipartFile file) throws IOException {
        return DocumentUtils.extractText(file);
    }

    private String extractImageContent(MultipartFile file, AiAgent agent, AiServicesProviderConfig providerConfig) throws IOException {
        return extractImageContent(file.getBytes(), file.getOriginalFilename(), normalizeContentType(file.getContentType()), agent, providerConfig);
    }

    private String extractImageContent(byte[] imageBytes, @Nullable String filename, String contentType, AiAgent agent, AiServicesProviderConfig providerConfig) throws IOException {
        var clientConfig = chatProviderBuilder.buildClientConfig(providerConfig);
        var chatModel = clientConfig.chatModel();

        var mimeType = toMimeType(normalizeContentType(contentType));
        var mediaResource = new NamedByteArrayResource(imageBytes, filename);
        var media = new Media(mimeType, mediaResource);

        // Generic extraction: transcribe text when present, otherwise provide a brief factual description
        var promptText = """
                You are extracting context from an attached image.
                - If the image contains text, transcribe it verbatim and keep the ordering.
                - Otherwise, provide a concise, factual description of the visible content (no speculation).
                Return only the extracted text or the concise description, without extra commentary.
                """;
        var options = chatProviderBuilder.buildVisionChatOptions(agent, chatModel);

        var userMessage = UserMessage.builder()
                .media(media)
                .text(promptText)
                .build();
        var prompt = new Prompt(List.of(userMessage), options);
        var response = chatModel.call(prompt);
        return response.getResult().getOutput().getText();
    }

    private String extractAudioContent(MultipartFile file, AiAgent agent) throws IOException {
        var providerConfig = providerConfigService.findProvider(agent.getProvider())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Missing OpenAI provider configuration"));

        var clientConfig = chatProviderBuilder.buildRecordingClientConfig(providerConfig);
        var api = clientConfig.api();

        var options = chatProviderBuilder.buildRecordingChatOptions(agent, api);


        var transcriptionModel = new OpenAiAudioTranscriptionModel(api, (OpenAiAudioTranscriptionOptions) options);
        var audioResource = new NamedByteArrayResource(file.getBytes(), file.getOriginalFilename());
        var prompt = new AudioTranscriptionPrompt(audioResource, options);
        var response = transcriptionModel.call(prompt);
        var transcription = response.getResult();
        return transcription != null ? transcription.getOutput() : "";
    }

    private String normalizeText(String text) {
        if (text == null) {
            return "";
        }
        var sanitized = text.replace("\r\n", "\n").replace("\r", "\n");
        sanitized = sanitized.replaceAll("(?m)^[ \t]+", "");
        sanitized = sanitized.replaceAll("(?m)[ \t]+$", "");
        sanitized = sanitized.replaceAll("\n{3,}", "\n\n");
        return sanitized.trim();
    }

    private String normalizeContentType(@Nullable String contentType) {
        return StringUtils.defaultIfBlank(contentType, MimeTypeUtils.APPLICATION_OCTET_STREAM_VALUE);
    }

    private AttachmentCategory validateAttachment(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "File is required");
        }
        if (file.getSize() < 0) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Invalid file size");
        }

        var contentType = normalizeContentType(file.getContentType()).toLowerCase(Locale.ROOT);
        var filename = StringUtils.defaultIfBlank(file.getOriginalFilename(), "").toLowerCase(Locale.ROOT);

        if (isPdf(contentType, filename)) {
            return AttachmentCategory.PDF;
        }
        if (isAllowedImage(contentType)) {
            return AttachmentCategory.IMAGE;
        }
        if (isAllowedAudio(contentType)) {
            return AttachmentCategory.AUDIO;
        }
        if (isAllowedDocument(contentType, filename)) {
            return AttachmentCategory.DOCUMENT;
        }

        throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Unsupported file type");
    }

    private boolean isAllowedImage(String contentType) {
        return ALLOWED_IMAGE_MIME.contains(contentType);
    }

    private boolean isAllowedAudio(String contentType) {
        return ALLOWED_AUDIO_MIME.contains(contentType);
    }

    private boolean isAllowedDocument(String contentType, String filename) {
        var allowedType = ALLOWED_DOC_MIME.contains(contentType);
        if (!allowedType) {
            return false;
        }
        if (StringUtils.isBlank(filename) || !filename.contains(".")) {
            return true;
        }
        var ext = filename.contains(".") ? filename.substring(filename.lastIndexOf('.') + 1) : "";
        return ALLOWED_DOC_EXT.contains(ext);
    }

    private boolean isPdf(String contentType, String filename) {
        if (ALLOWED_PDF_MIME.contains(contentType)) {
            return true;
        }
        if (StringUtils.isBlank(filename) || !filename.contains(".")) {
            return false;
        }
        var ext = filename.substring(filename.lastIndexOf('.') + 1);
        return "pdf".equalsIgnoreCase(ext);
    }

    private MimeType toMimeType(String contentType) {
        try {
            return MimeTypeUtils.parseMimeType(contentType);
        } catch (IllegalArgumentException ex) {
            return MimeTypeUtils.APPLICATION_OCTET_STREAM;
        }
    }

    private String summarizeFailure(Throwable exception) {
        if (exception instanceof HttpClientErrorException httpEx) {
            return httpEx.getStatusCode().value() + " " + httpEx.getStatusText();
        }
        return StringUtils.defaultIfBlank(exception.getMessage(), exception.getClass().getSimpleName());
    }

    private static class NamedByteArrayResource extends ByteArrayResource {
        private final String filename;

        private NamedByteArrayResource(byte[] byteArray, String filename) {
            super(byteArray);
            this.filename = StringUtils.defaultIfBlank(filename, "image");
        }

        @Override
        public String getFilename() {
            return filename;
        }
    }

    private enum AttachmentCategory {
        IMAGE,
        AUDIO,
        PDF,
        DOCUMENT
    }
}
