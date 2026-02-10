package bitecode.modules._common.service.cache;

import bitecode.modules._common.service.cache.provider.CacheProvider;
import bitecode.modules._common.service.cache.provider.memory.MemoryCacheProvider;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class CacheService {
    private final CacheProvider cacheProvider = new MemoryCacheProvider();

    public <K, V> CacheRef<K, V> createCache(String cacheName, long expirationTime, TimeUnit expirationTimeUnit) {
        cacheProvider.createCache(cacheName, expirationTime, expirationTimeUnit);
        return new CacheRef<>(cacheName, cacheProvider);
    }
}
