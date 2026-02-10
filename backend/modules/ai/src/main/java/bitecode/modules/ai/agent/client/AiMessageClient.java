package bitecode.modules.ai.agent.client;

import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.agent.data.StreamingResponse;
import bitecode.modules.ai.model.entity.AiAgent;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

@Service
public interface AiMessageClient {

    <T extends AiAgentRequestData> AiAgentChatResponseData message(@Nullable AiAgent aiAgent, T data);

    <T extends AiAgentRequestData> StreamingResponse streamMessages(@Nullable AiAgent aiAgent, T data);
}
