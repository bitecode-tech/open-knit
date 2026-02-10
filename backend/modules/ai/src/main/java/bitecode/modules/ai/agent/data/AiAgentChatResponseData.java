package bitecode.modules.ai.agent.data;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
public class AiAgentChatResponseData {
    private String message;
    private String error;
    private String previousResponseId;
}
