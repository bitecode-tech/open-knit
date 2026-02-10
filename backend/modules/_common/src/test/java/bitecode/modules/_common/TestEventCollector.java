package bitecode.modules._common;

import bitecode.modules._common.model.event.ModuleEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class TestEventCollector<T extends ModuleEvent> {

    private final List<T> events = new CopyOnWriteArrayList<>();
    private boolean lock = false;

    @EventListener(ModuleEvent.class)
    public void handle(T event) {
        if (!lock) {
            events.add(event);
        }
    }

    public <R extends T> List<R> getEventsOfType(Class<R> type) {
        return events.stream()
                .filter(type::isInstance)
                .map(type::cast)
                .toList();
    }

    public void lock() {
        this.lock = true;
    }

    public void unlock() {
        this.lock = false;
    }

    public void clear() {
        events.clear();
    }
}
