package bitecode.modules.ai.agent.data;

import lombok.Data;
import lombok.experimental.SuperBuilder;

import java.util.List;
import java.util.Map;

@Data
@SuperBuilder
public class UserChatResponse extends AiAgentChatResponseData {
    private List<Map<String, Object>> dataset;
}
