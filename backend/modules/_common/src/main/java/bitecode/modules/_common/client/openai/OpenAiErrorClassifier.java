package bitecode.modules._common.client.openai;

import com.openai.core.http.Headers;
import com.openai.errors.OpenAIIoException;
import com.openai.errors.OpenAIRetryableException;
import com.openai.errors.OpenAIServiceException;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

public final class OpenAiErrorClassifier {
    private static final String RETRY_AFTER_HEADER = "Retry-After";

    private OpenAiErrorClassifier() {
    }

    public static RetryableOpenAiAccessException toRetryableException(Throwable throwable) {
        if (throwable instanceof RetryableOpenAiAccessException retryableOpenAiAccessException) {
            return retryableOpenAiAccessException;
        }
        if (throwable instanceof WebClientResponseException responseException && isRetryableStatus(responseException.getStatusCode().value())) {
            return new RetryableOpenAiAccessException(
                    "OpenAI request failed with retryable status " + responseException.getStatusCode().value(),
                    responseException.getStatusCode().value(),
                    parseRetryAfter(responseException.getHeaders().getFirst(HttpHeaders.RETRY_AFTER)),
                    throwable
            );
        }
        if (throwable instanceof WebClientRequestException) {
            return new RetryableOpenAiAccessException(
                    "OpenAI request failed due to a temporary transport error",
                    null,
                    null,
                    throwable
            );
        }
        if (throwable instanceof OpenAIServiceException serviceException && isRetryableStatus(serviceException.statusCode())) {
            return new RetryableOpenAiAccessException(
                    "OpenAI request failed with retryable status " + serviceException.statusCode(),
                    serviceException.statusCode(),
                    parseRetryAfter(firstHeaderValue(serviceException.headers(), RETRY_AFTER_HEADER)),
                    throwable
            );
        }
        if (throwable instanceof OpenAIRetryableException || throwable instanceof OpenAIIoException) {
            return new RetryableOpenAiAccessException(
                    "OpenAI request failed due to a temporary transport error",
                    null,
                    null,
                    throwable
            );
        }
        return null;
    }

    public static boolean isRetryable(Throwable throwable) {
        return toRetryableException(throwable) != null;
    }

    private static boolean isRetryableStatus(int statusCode) {
        return statusCode == 408 || statusCode == 409 || statusCode == 429 || statusCode >= 500;
    }

    private static String firstHeaderValue(Headers headers, String headerName) {
        if (headers == null) {
            return null;
        }
        List<String> values = headers.values(headerName);
        return values.isEmpty() ? null : values.getFirst();
    }

    private static Instant parseRetryAfter(String retryAfter) {
        if (retryAfter == null || retryAfter.isBlank()) {
            return null;
        }
        var trimmedRetryAfter = retryAfter.trim();
        try {
            return Instant.now().plusSeconds(Long.parseLong(trimmedRetryAfter));
        } catch (NumberFormatException ignored) {
            try {
                return ZonedDateTime.parse(trimmedRetryAfter, DateTimeFormatter.RFC_1123_DATE_TIME).toInstant();
            } catch (DateTimeParseException ignoredAgain) {
                try {
                    return ZonedDateTime.parse(trimmedRetryAfter).toInstant();
                } catch (DateTimeParseException ignoredYetAgain) {
                    return null;
                }
            }
        }
    }
}
