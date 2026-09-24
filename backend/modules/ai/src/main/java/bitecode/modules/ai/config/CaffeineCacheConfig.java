package bitecode.modules.ai.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration("AiCaffeineCacheConfig")
public class CaffeineCacheConfig {
    public static final String AI_AGENT_CACHE_NAME = "ai:agent";
    public static final String AI_PROVIDER_CONFIG_CACHE_NAME = "ai:provider-config";

    @Bean
    @Primary
    public CacheManager aiCacheManager() {
        var cacheManager = new CaffeineCacheManager();
        cacheManager.registerCustomCache(
                AI_AGENT_CACHE_NAME,
                Caffeine.newBuilder()
                        .maximumSize(10)
                        .expireAfterWrite(Duration.ofMinutes(1))
                        .build()
        );
        cacheManager.registerCustomCache(
                AI_PROVIDER_CONFIG_CACHE_NAME,
                Caffeine.newBuilder()
                        .maximumSize(1)
                        .expireAfterWrite(Duration.ofMinutes(1))
                        .build()
        );
        return cacheManager;
    }
}
