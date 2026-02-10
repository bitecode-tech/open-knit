package bitecode.modules._common.eventsourcing.exception;

public class UnappliedCommandException extends RuntimeException {
    public UnappliedCommandException() {
    }

    public UnappliedCommandException(String message, Object... formatArgs) {
        super(String.format(message, formatArgs));
    }
}
