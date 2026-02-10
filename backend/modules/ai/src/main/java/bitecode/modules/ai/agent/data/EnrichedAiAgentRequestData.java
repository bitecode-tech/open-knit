package bitecode.modules.ai.agent.data;

import bitecode.modules.ai.model.entity.ChatSessionMessage;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.SuperBuilder;
import org.springframework.lang.Nullable;

import java.util.ArrayList;
import java.util.List;

@Data
@SuperBuilder
public class EnrichedAiAgentRequestData extends AiAgentRequestData {
    @Builder.Default
    private List<ChatSessionMessage> messages = new ArrayList<>();
    @Nullable
    private String lastResponseId;

    public static abstract class EnrichedAiAgentRequestDataBuilder
            <C extends EnrichedAiAgentRequestData, B extends EnrichedAiAgentRequestDataBuilder<C, B>>
            extends AiAgentRequestData.AiAgentRequestDataBuilder<C, B> {
        public B requestData(AiAgentRequestData data) {
            this.message(data.getMessage());
            this.userId(data.getUserId());
            this.externalSessionId(data.getExternalSessionId());
            this.attachments(data.getAttachments());
            this.rawAttachments(data.getRawAttachments());
            return (B) this;
        }
    }
}
