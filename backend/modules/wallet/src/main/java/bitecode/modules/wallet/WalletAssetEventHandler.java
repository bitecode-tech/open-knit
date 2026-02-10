package bitecode.modules.wallet;

import bitecode.modules._common.eventsourcing.exception.UnappliedCommandException;
import bitecode.modules._common.eventsourcing.model.GenericCommandHandler;
import bitecode.modules._common.service.cache.CacheService;
import bitecode.modules._common.service.locking.InMemoryLock;
import bitecode.modules.wallet.handler.command.AbstractWalletAssetCommandHandler;
import bitecode.modules.wallet.model.command.AbstractWalletAssetCommand;
import bitecode.modules.wallet.model.command.CreateWalletAssetCommand;
import bitecode.modules.wallet.model.entity.WalletAsset;
import bitecode.modules.wallet.model.entity.WalletAssetEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
public class WalletAssetEventHandler extends GenericCommandHandler<AbstractWalletAssetCommand, WalletAsset, AbstractWalletAssetCommandHandler<AbstractWalletAssetCommand>, WalletAssetEvent, Object> {
    private final InMemoryLock assetLock;
    private final WalletService walletService;

    public interface Params {
        String BEFORE_WALLET_ASSET_TOTAL = "BEFORE_WALLET_ASSET_TOTAL";
    }

    public WalletAssetEventHandler(List<AbstractWalletAssetCommandHandler<?>> commandHandlers, WalletAssetEventRepository eventRepository, WalletService walletService,
                                   CacheService cacheService, ApplicationEventPublisher eventPublisher) {
        super(commandHandlers, eventRepository, eventPublisher);
        this.walletService = walletService;
        this.assetLock = new InMemoryLock(cacheService, "WALLET_ASSET_LOCK");
    }

    @Override
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Optional<Object> handle(AbstractWalletAssetCommand command) {
        return super.handle(command);
    }

    @Override
    protected WalletAssetEvent toEventEntity(AbstractWalletAssetCommand command, WalletAsset entity, Map<String, Object> params) {
        var totalBefore = (BigDecimal) params.get(Params.BEFORE_WALLET_ASSET_TOTAL);
        if (totalBefore == null) {
            throw new UnappliedCommandException("Event %s :Missing required parameter %s", command.getClass().getSimpleName(), Params.BEFORE_WALLET_ASSET_TOTAL);
        }
        return WalletAssetEvent.builder()
                .walletAssetId(entity.getId())
                .eventName(command.getClass().getSimpleName())
                .eventData(command)
                .assetName(entity.getName())
                .totalBefore(totalBefore)
                .totalAmount(command.getAmount())
                .totalAfter(entity.getTotalAmount())
                .build();
    }

    @Override
    protected Object toReturnType(WalletAsset entity) {
        return new Object();
    }

    @Override
    protected Class<AbstractWalletAssetCommand> getGenericCommandTypeClass() {
        return AbstractWalletAssetCommand.class;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override
    protected void preHandleFunction(AbstractWalletAssetCommand event, Map<String, Object> params) {
        super.preHandleFunction(event, params);
        if (event.getClass() != CreateWalletAssetCommand.class) {
            var walletAssetOp = walletService.findWalletAsset(event.getUserId(), event.getCurrency());
            if (walletAssetOp.isEmpty()) {
                this.handle(CreateWalletAssetCommand.builder()
                        .userId(event.getUserId())
                        .amount(BigDecimal.ZERO)
                        .currency(event.getCurrency())
                        .referenceId("SYSTEM")
                        .build()
                );
            }
        }
        var isLocked = assetLock.tryLock(lockKeyOf(event));
        params.put("__IS_LOCKED__", isLocked);
    }

    @Override
    protected void finallyFunction(AbstractWalletAssetCommand event, Map<String, Object> params) {
        super.finallyFunction(event, params);
        if ((boolean) params.get("__IS_LOCKED__")) {
            assetLock.unlock(lockKeyOf(event));
        }
    }

    private static String lockKeyOf(AbstractWalletAssetCommand event) {
        return event.getUserId() + event.getCurrency();
    }
}
