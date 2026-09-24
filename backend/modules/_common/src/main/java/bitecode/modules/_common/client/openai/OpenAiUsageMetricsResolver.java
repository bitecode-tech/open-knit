package bitecode.modules._common.client.openai;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

public final class OpenAiUsageMetricsResolver {
    private static final BigDecimal TOKENS_PER_MILLION = BigDecimal.valueOf(1_000_000L);
    private static final Map<String, TextModelPricing> OPEN_AI_TEXT_MODEL_PRICING = Map.of(
            "gpt-4o-mini", new TextModelPricing("0.15", "0.075", "0.60"),
            "gpt-5.4", new TextModelPricing("2.50", "0.25", "15.00"),
            "gpt-5.4-mini", new TextModelPricing("0.75", "0.075", "4.50"),
            "gpt-5.4-nano", new TextModelPricing("0.20", "0.02", "1.25"),
            "gpt-5-mini", new TextModelPricing("0.25", "0.025", "2.00")
    );

    private OpenAiUsageMetricsResolver() {
    }

    public static OpenAiUsageMetrics build(Map<String, Object> response, String model) {
        if (response == null) {
            return null;
        }

        var usage = asMap(response.get("usage"));
        if (usage == null) {
            return null;
        }

        var inputTokens = asInteger(usage.get("input_tokens"));
        var outputTokens = asInteger(usage.get("output_tokens"));
        var totalTokens = asInteger(usage.get("total_tokens"));
        var inputTokensDetails = asMap(usage.get("input_tokens_details"));
        var cachedInputTokens = inputTokensDetails != null ? asInteger(inputTokensDetails.get("cached_tokens")) : 0;
        var uncachedInputTokens = Math.max(inputTokens - cachedInputTokens, 0);

        return new OpenAiUsageMetrics(
                inputTokens,
                cachedInputTokens,
                uncachedInputTokens,
                outputTokens,
                totalTokens,
                estimateCostUsd(model, uncachedInputTokens, cachedInputTokens, outputTokens)
        );
    }

    private static BigDecimal estimateCostUsd(String model,
                                              int uncachedInputTokens,
                                              int cachedInputTokens,
                                              int outputTokens) {
        var pricing = OPEN_AI_TEXT_MODEL_PRICING.get(model);
        if (pricing == null) {
            return null;
        }

        var uncachedInputCost = BigDecimal.valueOf(uncachedInputTokens)
                .multiply(pricing.inputUsdPerMillion())
                .divide(TOKENS_PER_MILLION, 12, RoundingMode.HALF_UP);
        var cachedInputCost = BigDecimal.valueOf(cachedInputTokens)
                .multiply(pricing.cachedInputUsdPerMillion())
                .divide(TOKENS_PER_MILLION, 12, RoundingMode.HALF_UP);
        var outputCost = BigDecimal.valueOf(outputTokens)
                .multiply(pricing.outputUsdPerMillion())
                .divide(TOKENS_PER_MILLION, 12, RoundingMode.HALF_UP);

        return uncachedInputCost
                .add(cachedInputCost)
                .add(outputCost)
                .setScale(6, RoundingMode.HALF_UP);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> mapValue) {
            return (Map<String, Object>) mapValue;
        }
        return null;
    }

    private static int asInteger(Object value) {
        if (value instanceof Number numberValue) {
            return numberValue.intValue();
        }
        return 0;
    }

    private record TextModelPricing(
            BigDecimal inputUsdPerMillion,
            BigDecimal cachedInputUsdPerMillion,
            BigDecimal outputUsdPerMillion
    ) {
        private TextModelPricing(String inputUsdPerMillion,
                                 String cachedInputUsdPerMillion,
                                 String outputUsdPerMillion) {
            this(
                    new BigDecimal(inputUsdPerMillion),
                    new BigDecimal(cachedInputUsdPerMillion),
                    new BigDecimal(outputUsdPerMillion)
            );
        }
    }
}
