package bitecode.modules.ai.config;

import org.springframework.ai.transformer.splitter.TextSplitter;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RagConfig {
    @Bean
    public TextSplitter textSplitter() {
        return new TokenTextSplitter(true);
    }
}
