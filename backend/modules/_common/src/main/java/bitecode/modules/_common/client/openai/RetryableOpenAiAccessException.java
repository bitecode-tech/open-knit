package bitecode.modules._common.client.openai;

import java.time.Instant;

public class RetryableOpenAiAccessException extends RuntimeException {
    private final Integer statusCode;
    private final Instant retryAfter;

    public RetryableOpenAiAccessException(String message, Integer statusCode, Instant retryAfter, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
        this.retryAfter = retryAfter;
    }

    public Integer getStatusCode() {
        return statusCode;
    }

    public Instant getRetryAfter() {
        return retryAfter;
    }
}
