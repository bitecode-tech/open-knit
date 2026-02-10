package bitecode.modules.ai.utils;

import io.netty.handler.logging.LogLevel;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import reactor.netty.transport.logging.AdvancedByteBufFormat;

public class LoggingUtils {

    public static WebClient.Builder getLoggingWebClient() {
        var httpClient = HttpClient.create()
                .wiretap(LoggingUtils.class.getCanonicalName(), LogLevel.DEBUG, AdvancedByteBufFormat.TEXTUAL);
        var conn = new ReactorClientHttpConnector(httpClient);

        return WebClient.builder()
                .clientConnector(conn);
    }
}
