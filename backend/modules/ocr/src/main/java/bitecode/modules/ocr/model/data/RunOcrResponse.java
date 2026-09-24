package bitecode.modules.ocr.model.data;

import bitecode.modules._common.client.openai.OpenAiUsageMetrics;

public record RunOcrResponse(
        String resultText,
        OpenAiUsageMetrics usageMetrics
) {
}
