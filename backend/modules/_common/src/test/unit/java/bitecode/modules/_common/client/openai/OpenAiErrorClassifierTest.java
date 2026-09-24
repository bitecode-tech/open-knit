package bitecode.modules._common.client.openai;

import com.openai.core.http.Headers;
import com.openai.errors.OpenAIIoException;
import com.openai.errors.RateLimitException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.charset.StandardCharsets;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;

public class OpenAiErrorClassifierTest {

    @Test
    @DisplayName("Should classify OpenAI 429 WebClient response as retryable")
    void shouldClassifyOpenAi429WebClientResponseAsRetryable() {
        var headers = new HttpHeaders();
        headers.add(HttpHeaders.RETRY_AFTER, "120");
        var exception = WebClientResponseException.create(
                HttpStatus.TOO_MANY_REQUESTS.value(),
                "Too Many Requests",
                headers,
                new byte[0],
                StandardCharsets.UTF_8
        );

        var retryableException = OpenAiErrorClassifier.toRetryableException(exception);

        assertThat(retryableException, is(notNullValue()));
        assertThat(retryableException.getStatusCode(), is(HttpStatus.TOO_MANY_REQUESTS.value()));
        assertThat(retryableException.getRetryAfter(), is(notNullValue()));
    }

    @Test
    @DisplayName("Should classify OpenAI SDK rate limit exception as retryable")
    void shouldClassifyOpenAiSdkRateLimitExceptionAsRetryable() {
        var exception = RateLimitException.builder()
                .headers(Headers.builder().put("Retry-After", "120").build())
                .build();

        var retryableException = OpenAiErrorClassifier.toRetryableException(exception);

        assertThat(retryableException, is(notNullValue()));
        assertThat(retryableException.getStatusCode(), is(HttpStatus.TOO_MANY_REQUESTS.value()));
        assertThat(retryableException.getRetryAfter(), is(notNullValue()));
    }

    @Test
    @DisplayName("Should classify OpenAI SDK IO exception as retryable")
    void shouldClassifyOpenAiSdkIoExceptionAsRetryable() {
        var retryableException = OpenAiErrorClassifier.toRetryableException(new OpenAIIoException("temporary"));

        assertThat(retryableException, is(notNullValue()));
        assertThat(retryableException.getStatusCode(), is(nullValue()));
    }

    @Test
    @DisplayName("Should not classify OpenAI bad request as retryable")
    void shouldNotClassifyOpenAiBadRequestAsRetryable() {
        var exception = WebClientResponseException.create(
                HttpStatus.BAD_REQUEST.value(),
                "Bad Request",
                HttpHeaders.EMPTY,
                new byte[0],
                StandardCharsets.UTF_8
        );

        assertThat(OpenAiErrorClassifier.toRetryableException(exception), is(nullValue()));
    }
}
