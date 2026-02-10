package bitecode.modules._common.eventsourcing.model;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Abstract class responsible for handling commands and managing associated handlers and repositories.
 *
 * <p>This class is designed to handle various commands by associating them with the appropriate
 * handler (EHT). It also interacts with an event repository (EN) to persist or retrieve
 * event entities. The handler utilizes an ObjectMapper to handle serialization/deserialization
 * of data as needed.</p>
 *
 * @param <C>   the type of the command to handle, extending {@link Command}
 * @param <T>   the type of the handler entity
 * @param <CHT> the type of the command handler, extending {@link AbstractCommandHandler}
 * @param <EN>  the type of the event entity, typically managed by {@link JpaRepository}
 * @param <RT>  the return type, typically the result of command handling or command processing
 */

@Slf4j
public abstract class GenericCommandHandler<C extends Command, T, CHT extends AbstractCommandHandler<T, C>, EN extends Event, RT> {
    /**
     * A map that associates each command type with its corresponding handler.
     */
    private final Map<Class<? extends Command>, CHT> commandHandlerMap;
    /**
     * The repository used to persist or retrieve event entities.
     */
    private final JpaRepository<EN, ?> eventRepository;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Constructor to initialize the CommandHandler with a list of command handlers,
     * an event repository, and an object mapper.
     *
     * @param commandHandlers a list of command handlers to be associated with the command handler
     * @param eventRepository the repository to interact with event entities
     */
    @SuppressWarnings("unchecked")
    public GenericCommandHandler(List<? extends AbstractCommandHandler<T, ? extends Command>> commandHandlers, JpaRepository<EN, ?> eventRepository, ApplicationEventPublisher eventPublisher) {
        this.commandHandlerMap = commandHandlers.stream()
                .map(eventHandler -> {
                    if (!this.getGenericCommandTypeClass().isAssignableFrom(eventHandler.getCommandClass())) {
                        throw new RuntimeException("This command handler shouldn't be here");
                    }
                    return (CHT) eventHandler;
                }).collect(Collectors.toMap(AbstractCommandHandler::getCommandClass, Function.identity()));
        this.eventRepository = eventRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Handles the given command by executing its corresponding handler and persisting
     * the resulting event entity to the event repository. This method ensures that the process is
     * transactional and provides hooks for pre- and post-processing.
     *
     * <p>The method first invokes the {@link #preHandleFunction(C event, Map params)} for pre-processing, then
     * retrieves the corresponding handler from the {@link #commandHandlerMap} and executes
     * it. After handling the command, the resulting entity is saved to the event repository. Finally,
     * the {@link #postHandleFunction(C event, T entity, Map params)} method is called for post-processing.</p>
     *
     * <p>If an {@link UnappliedCommandException} is thrown during the command handling process,
     * a debug log is generated and no further processing occurs. Any other exceptions are logged as
     * errors, and an {@link HttpClientErrorException} with an internal server error status is thrown.</p>
     *
     * @param command the command to be handled, typically extending {@link Command}
     * @return an {@link Optional} containing the return type of the command handling, if successful
     * (wrapped in {@link Optional}), or {@link Optional#empty()} if there is an exception or
     * the command is unapplied
     * @throws HttpClientErrorException if an unexpected exception occurs during the handling process
     */

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<RT> handle(C command) {
        var params = new HashMap<String, Object>();
        try {
            var commandHandler = commandHandlerMap.get(command.getClass());
            preHandleFunction(command, params);
            var entity = commandHandler.handle(command, params);
            postHandleFunction(command, entity, params);
            var moduleEvent = commandHandler.toModuleEvent(command, entity, params);
            if (moduleEvent != null) {
                eventPublisher.publishEvent(moduleEvent);
            }
            eventRepository.save(toEventEntity(command, entity, params));
            return Optional.of(toReturnType(entity));
        } catch (UnappliedCommandException unappliedCommandException) {
            if (log.isDebugEnabled()) {
                log.debug("CommandHandler::handle,unappliedevent,ex={}", unappliedCommandException.getMessage());
            }
            throw unappliedCommandException;
        } catch (Exception e) {
            log.error("CommandHandler::handle,exception,error={}", e, e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
        } finally {
            finallyFunction(command, params);
        }
    }

    protected abstract Class<C> getGenericCommandTypeClass();

    protected abstract EN toEventEntity(C command, T entity, Map<String, Object> params) throws IOException;

    protected abstract RT toReturnType(T entity);

    protected void preHandleFunction(C event, Map<String, Object> params) {

    }

    protected void postHandleFunction(C event, T entity, Map<String, Object> params) {

    }

    protected void finallyFunction(C event, Map<String, Object> params) {

    }
}
