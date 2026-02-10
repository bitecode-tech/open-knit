package bitecode.modules.ai.agent;

import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.model.entity.AiAgent;
import org.springframework.lang.Nullable;
import reactor.core.publisher.Flux;

public interface StreamingAiAgentStrategy extends AiAgentStrategy {
    <T extends AiAgentRequestData> Flux<String> streamMessages(@Nullable AiAgent aiAgent, T data);
}
