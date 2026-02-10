package bitecode.modules.ai.agent;

import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.model.entity.AiAgent;
import org.springframework.lang.Nullable;

public interface AiAgentStrategy {
    String name();

    <T extends AiAgentRequestData> AiAgentChatResponseData message(@Nullable AiAgent aiAgent, T data);
}
