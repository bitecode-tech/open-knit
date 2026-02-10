package bitecode.modules._common.service.cache.provider.memory;

import bitecode.modules._common.service.cache.provider.CacheProvider;
import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class MemoryCacheProvider implements CacheProvider {
    private final Map<String, Cache<Object, Object>> cacheMap = new HashMap<>();

    public void createCache(String cacheName, long expireAfter, TimeUnit expireAfterUnit) {
        cacheMap.put(cacheName, CacheBuilder.newBuilder()
                .expireAfterWrite(expireAfter, expireAfterUnit)
                .build());
    }

    @Override
    public void put(String cacheName, Object key, Object value) {
        var cache = getCache(cacheName);
        if (cache != null) {
            cache.put(key, value);
        }
    }

    @Override
    public Object get(String cacheName, Object key) {
        var cache = getCache(cacheName);
        return cache != null ? cache.getIfPresent(key) : null;
    }

    @Override
    public Object getAndRemove(String cacheName, Object key) {
        var elem = get(cacheName, key);
        if (elem != null) {
            remove(cacheName, key);
        }
        return elem;
    }

    @Override
    public void remove(String cacheName, Object key) {
        var cache = getCache(cacheName);
        if (cache != null) {
            cache.invalidate(key);
        }
    }

    @Override
    public void clearCache(String cacheName) {
        var cache = getCache(cacheName);
        if (cache != null) {
            cache.invalidateAll();
        }
    }

    private Cache<Object, Object> getCache(String cacheName) {
        return cacheMap.get(cacheName);
    }
}
