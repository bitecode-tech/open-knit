package bitecode.modules._common.service.cache.provider;

import java.util.concurrent.TimeUnit;

public interface CacheProvider {
    void createCache(String cacheName, long expireAfter, TimeUnit expireAfterUnit);

    void put(String cacheName, Object key, Object value);

    Object get(String cacheName, Object key);

    Object getAndRemove(String cacheName, Object key);

    void remove(String cacheName, Object key);

    void clearCache(String cacheName);
}
