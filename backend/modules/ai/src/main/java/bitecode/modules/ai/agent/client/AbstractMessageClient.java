package bitecode.modules.ai.agent.client;

import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.agent.data.EnrichedAiAgentRequestData;
import bitecode.modules.ai.agent.provider.VectorStoreFactory;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.entity.AiServicesProviderConfig;
import bitecode.modules.ai.service.AiServicesProviderConfigService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.content.Media;
import org.springframework.ai.document.Document;
import org.springframework.http.HttpStatus;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public abstract class AbstractMessageClient implements AiMessageClient {

    protected final AiServicesProviderConfigService providerConfigService;
    protected final VectorStoreFactory vectorStoreFactory;

    protected PromptData buildPromptData(AiAgent aiAgent, AiAgentRequestData data, AiServicesProviderConfig providerConfig) {
        String message = data.getMessage();

        var messages = new ArrayList<PromptMessage>();
        addSystemMessage(aiAgent, messages);
        addHistoryMessages(data, messages);
        var attachmentSummary = addAttachmentContext(data, messages);
        message += attachmentSummary;
        addKnowledgeContext(providerConfig, message, messages);

        var mediaList = data.getAttachments().stream()
                .filter(attachment -> attachment instanceof AiAgentRequestData.AttachableContent)
                .map(attachment -> (AiAgentRequestData.AttachableContent) attachment)
                .map(AiAgentRequestData.AttachableContent::getMedia)
                .toList();

        var uploadedFiles = data.getAttachments().stream()
                .filter(attachment -> attachment instanceof AiAgentRequestData.UploadedAttachment)
                .map(attachment -> (AiAgentRequestData.UploadedAttachment) attachment)
                .map(AiAgentRequestData.UploadedAttachment::getFileId)
                .map(UploadedInputFile::new)
                .toList();

        messages.add(PromptMessage.user(message, mediaList));

        return new PromptData(messages, uploadedFiles);
    }

    protected List<? extends Message> toSpringMessages(PromptData promptData) {
        return promptData.messages().stream()
                .map(message -> {
                    if (message.role() == PromptRole.SYSTEM) {
                        return new SystemMessage(message.text());
                    }
                    return UserMessage.builder()
                            .text(message.text())
                            .media(message.media())
                            .build();
                })
                .toList();
    }

    protected void addSystemMessage(AiAgent aiAgent, List<PromptMessage> messages) {
        if (StringUtils.isNotBlank(aiAgent.getSystemMessage())) {
            messages.add(PromptMessage.system(aiAgent.getSystemMessage()));
        }
    }

    protected void addHistoryMessages(AiAgentRequestData data, List<PromptMessage> messages) {
        if (data instanceof EnrichedAiAgentRequestData enrichedData) {
            enrichedData.getMessages().forEach(sessionMessage -> {
                switch (sessionMessage.getType()) {
                    case USER -> messages.add(PromptMessage.user(sessionMessage.getMessage(), List.of()));
                    case AGENT -> messages.add(PromptMessage.system(sessionMessage.getMessage()));
                    case null, default -> throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Error UserConfigurableAgentStrategy");
                }
            });
        }
    }

    protected void addKnowledgeContext(AiServicesProviderConfig providerConfig, String message, List<PromptMessage> messages) {
        if (StringUtils.isNotBlank(message)) {
            var relevantDocs = vectorStoreFactory.buildVectorStore(providerConfig).similaritySearch(message);
            if (!CollectionUtils.isEmpty(relevantDocs)) {
                var context = relevantDocs.stream()
                        .map(Document::getFormattedContent)
                        .collect(Collectors.joining("\n\n"));
                messages.add(PromptMessage.system("Use following context for next user message: \n\n" + context));
            }
        }
    }

    protected String addAttachmentContext(AiAgentRequestData data, List<PromptMessage> messages) {
        var attachments = data.getAttachments();
        if (attachments == null || attachments.isEmpty()) {
            return "";
        }
        var instructions = """
                You will receive attachments provided by user, attached here by giving you attachment filename, mime type and it's content.
                Consider while returning response them and refer to their content if asked. \n
                """;
        var extractedContents = attachments.stream()
                .filter(Objects::nonNull)
                .filter(attachmentContent -> attachmentContent instanceof AiAgentRequestData.ExtractedAttachment)
                .map(attachmentContent -> (AiAgentRequestData.ExtractedAttachment) attachmentContent)
                .toList();
        if (!extractedContents.isEmpty()) {
            return instructions + extractedContents.stream().map(this::buildAttachmentSummary)
                    .peek(summary -> messages.add(PromptMessage.user(summary, List.of())))
                    .collect(Collectors.joining("\n\n"));
        }
        return "";

    }

    protected String buildAttachmentSummary(AiAgentRequestData.ExtractedAttachment attachment) {
        var builder = new StringBuilder();

        var filename = StringUtils.defaultString(attachment.getFilename(), "attachment");
        var mime = StringUtils.defaultIfBlank(attachment.getMimeType(), "unknown");

        if (attachment.isFailed()) {
            builder.append("Attachment (included as text)\\n filename:")
                    .append(filename)
                    .append(" mime:(")
                    .append(mime)
                    .append(") could not be processed: ")
                    .append(StringUtils.defaultIfBlank(attachment.getFailureReason(), "Unknown error"));
            return builder.toString();
        }

        if (StringUtils.isBlank(attachment.getContent())) {
            builder.append("Attachment (included as text)\\n filename:")
                    .append(filename)
                    .append(" mime:(")
                    .append(mime)
                    .append(") was uploaded, but no extractable content was found. "
                            + "If the user asks for a transcription, let them know the file could not be read as text.");
            return builder.toString();
        }

        builder.append("Attachment (included as text)\\n filename:")
                .append(filename)
                .append(" mime:(")
                .append(mime)
                .append(") content:\n")
                .append(attachment.getContent());

        return builder.toString();
    }

    protected String extractResponseBody(Throwable ex) {
        if (ex instanceof WebClientResponseException webClientEx) {
            try {
                return webClientEx.getResponseBodyAsString();
            } catch (Exception ignored) {
                // fall through
            }
        }
        return "n/a";
    }

    protected record PromptData(List<PromptMessage> messages, List<? extends ExtraContent> extraContents) {
    }

    protected record PromptMessage(PromptRole role, String text, List<Media> media) {
        static PromptMessage system(String text) {
            return new PromptMessage(PromptRole.SYSTEM, text, null);
        }

        static PromptMessage user(String text, List<Media> media) {
            return new PromptMessage(PromptRole.USER, text, media);
        }
    }

    protected interface ExtraContent {
        String value();
    }

    protected record UploadedInputFile(String value) implements ExtraContent {
    }

    protected enum PromptRole {
        USER, SYSTEM
    }
}
