package bitecode.modules.ai.agent.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.ai.content.Media;
import org.springframework.lang.Nullable;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@SuperBuilder
public class AiAgentRequestData {
    private String message;
    @Nullable
    private String externalSessionId;
    @Nullable
    private UUID userId;
    @Builder.Default
    private List<AttachmentContent> attachments = new ArrayList<>();
    @Builder.Default
    private List<MultipartFile> rawAttachments = new ArrayList<>();

    @Data
    @SuperBuilder
    @AllArgsConstructor
    @NoArgsConstructor
    public static abstract class AttachmentContent {
        @Builder.Default
        private boolean failed = false;
        private String failureReason;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadedAttachment extends AttachmentContent {
        private String fileId;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttachableContent extends AttachmentContent {
        private Media media;
    }

    @Data
    @SuperBuilder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExtractedAttachment extends AttachmentContent {
        private String filename;
        private String mimeType;
        private String content;
        private long sizeBytes;
    }
}
