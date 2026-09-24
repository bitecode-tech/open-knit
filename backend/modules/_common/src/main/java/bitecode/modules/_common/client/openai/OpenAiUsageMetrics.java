package bitecode.modules._common.client.openai;

import java.math.BigDecimal;

public record OpenAiUsageMetrics(
        Integer inputTokens,
        Integer cachedInputTokens,
        Integer uncachedInputTokens,
        Integer outputTokens,
        Integer totalTokens,
        BigDecimal estimatedCostUsd
) {
}
