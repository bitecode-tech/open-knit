package bitecode.modules._common.service.cache;

import bitecode.modules._common.service.cache.provider.CacheProvider;
import lombok.RequiredArgsConstructor;

import java.util.Optional;

@RequiredArgsConstructor
public class CacheRef<K, V> {
    private final String cacheName;
    private final CacheProvider cacheProvider;

    public void put(K key, V value) {
        cacheProvider.put(cacheName, key, value);
    }

    public Optional<V> get(K key) {
        return Optional.ofNullable((V) cacheProvider.get(cacheName, key));
    }

    public Optional<V> isPresent(K key) {
        return Optional.ofNullable((V) cacheProvider.get(cacheName, key));
    }

    public Optional<V> getAndRemove(K key) {
        return Optional.ofNullable((V) cacheProvider.getAndRemove(cacheName, key));
    }

    public void remove(K key) {
        cacheProvider.remove(cacheName, key);
    }

    public void clear() {
        cacheProvider.clearCache(cacheName);
    }
}
