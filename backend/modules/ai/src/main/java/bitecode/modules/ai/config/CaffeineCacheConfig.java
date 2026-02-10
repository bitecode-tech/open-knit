package bitecode.modules.ai.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.boot.autoconfigure.cache.CacheManagerCustomizer;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration("AiCaffeineCacheConfig")
public class CaffeineCacheConfig {
    public static final String AI_AGENT_CACHE_NAME = "ai:agent";
    public static final String AI_PROVIDER_CONFIG_CACHE_NAME = "ai:provider-config";

    @Bean
    public CacheManagerCustomizer<CaffeineCacheManager> aiAgentCache() {
        return cacheManager -> cacheManager.registerCustomCache(
                AI_AGENT_CACHE_NAME,
                Caffeine.newBuilder()
                        .maximumSize(10)
                        .expireAfterWrite(Duration.ofMinutes(1))
                        .build()
        );
    }

    @Bean
    public CacheManagerCustomizer<CaffeineCacheManager> aiProviderConfigCache() {
        return cacheManager -> cacheManager.registerCustomCache(
                AI_PROVIDER_CONFIG_CACHE_NAME,
                Caffeine.newBuilder()
                        .maximumSize(1)
                        .expireAfterWrite(Duration.ofMinutes(1))
                        .build()
        );
    }
}
