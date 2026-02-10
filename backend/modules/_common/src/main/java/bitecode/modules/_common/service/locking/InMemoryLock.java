package bitecode.modules._common.service.locking;

import bitecode.modules._common.service.cache.CacheRef;
import bitecode.modules._common.service.cache.CacheService;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

public class InMemoryLock {
    private final CacheRef<String, Integer> cacheRef;

    public InMemoryLock(CacheService cacheService, String name) {
        this.cacheRef = cacheService.createCache(name + "-lock", 3, TimeUnit.MINUTES);
    }

    public <T> T tryLockWrap(String key, Supplier<T> function) {
        var locked = this.tryLock(key);
        try {
            return function.get();
        } finally {
            if (locked) {
                this.unlock(key);
            }
        }
    }

    public void tryLockWrap(String key, Runnable function) {
        this.tryLockWrap(key, () -> {
            function.run();
            return null;
        });
    }

    public synchronized boolean tryLock(String key) {
        if (this.isLocked(key)) {
            throw new HttpClientErrorException(HttpStatus.LOCKED);
        }
        cacheRef.put(key, Integer.MAX_VALUE);
        return true;
    }

    public void unlock(String key) {
        cacheRef.remove(key);
    }

    public boolean isLocked(String key) {
        return cacheRef.get(key).isPresent();
    }
}
