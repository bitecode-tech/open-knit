package bitecode.modules._common.eventsourcing.model;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules._common.model.event.ModuleEvent;

import java.util.Map;

public abstract class AbstractCommandHandler<R, C extends Command> {
    public abstract R handle(C command, Map<String, Object> params) throws UnappliedCommandException;

    public ModuleEvent toModuleEvent(C command, R object, Map<String, Object> params) {
        return null;
    }

    public abstract Class<C> getCommandClass();

    protected UnappliedCommandException genericUnappliedHandlerException(Command command) {
        return new UnappliedCommandException("Could not find transaction by paymentId,command=" + command);
    }
}
