package bitecode.modules._common.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CaffeineCacheConfig {
    // register caches in each module using CacheManagerCustomizer bean
    @Bean
    public CacheManager cacheManager() {
        return new CaffeineCacheManager();
    }
}
