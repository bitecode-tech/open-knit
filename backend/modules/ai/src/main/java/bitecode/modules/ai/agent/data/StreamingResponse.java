package bitecode.modules.ai.agent.data;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public record StreamingResponse(Flux<String> messageChunks, Mono<String> responseId) {
    public StreamingResponse(Flux<String> stream) {
        this(stream, Mono.empty());
    }
}