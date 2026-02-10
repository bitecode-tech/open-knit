package bitecode.modules._common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@TestConfiguration
@RequiredArgsConstructor
@Slf4j
public class IntegrationTestConfig {

    @Bean
    public ExecutorService executors() {
        // on purpose, due to async listeners
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
