package bitecode.modules.payment.subscription;

import bitecode.modules._common.service.cache.CacheService;
import bitecode.modules._common.service.locking.InMemoryLock;
import bitecode.modules._common.shared.identity.user.UserServiceFacade;
import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import bitecode.modules._common.util.AuthUtils;
import bitecode.modules.payment.payment.PaymentService;
import bitecode.modules.payment.payment.model.data.CreateNewPaymentData;
import bitecode.modules.payment.subscription.model.data.UpdateSubscriptionPlanData;
import bitecode.modules.payment.subscription.model.entity.Subscription;
import bitecode.modules.payment.subscription.model.entity.SubscriptionHistory;
import bitecode.modules.payment.subscription.model.entity.SubscriptionPlan;
import bitecode.modules.payment.subscription.model.enums.SubscriptionStatus;
import bitecode.modules.payment.subscription.model.mapper.SubscriptionMapper;
import bitecode.modules.payment.subscription.model.projection.PlanSubscriptionsCount;
import bitecode.modules.payment.subscription.model.provider.InitSubscriptionResult;
import bitecode.modules.payment.subscription.model.provider.SubscriptionProvider;
import bitecode.modules.payment.subscription.model.request.NewSubscriptionPlanRequest;
import bitecode.modules.payment.subscription.repository.SubscriptionPlanRepository;
import bitecode.modules.payment.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.function.Function;
import java.util.stream.Collectors;

import static bitecode.modules._common.util.DateUtils.DEFAULT_ZONE_ID;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubscriptionService {
    private final ExecutorService executorService;
    private final UserServiceFacade userServiceFacade;
    private final PaymentService paymentService;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionMapper subscriptionMapper;
    private Map<PaymentGateway, SubscriptionProvider> paymentProviders;
    private InMemoryLock inMemoryLock;

    public Optional<Subscription> findSubscriptionByUuid(UUID uuid) {
        return subscriptionRepository.findByUuid(uuid);
    }

    public Optional<SubscriptionPlan> findSubscriptionPlanByUuidFetchSubscriptions(UUID uuid) {
        return subscriptionPlanRepository.findByUuidFetchSubscriptions(uuid);
    }

    public List<Subscription> findAllByUserIdInAndActive(List<UUID> userIds, boolean active) {
        if (active) {
            return subscriptionRepository.findAllByUserIdInAndStatusNotIn(userIds, List.of(SubscriptionStatus.CANCELED, SubscriptionStatus.CANCELLING));
        }
        return subscriptionRepository.findAllByUserIdIn(userIds);
    }

    public Page<SubscriptionPlan> findAllPlans(Pageable pageable) {
        return subscriptionPlanRepository.findAll(pageable);
    }

    public boolean existsByUserIdAndSubscriptionPlanUuid(UUID userId, UUID subscriptionPlanId) {
        return subscriptionRepository.existsByUserIdAndSubscriptionPlanUuid(userId, subscriptionPlanId);
    }

    @Transactional
    public InitSubscriptionResult createAndInitSubscription(UUID subscriptionPlanId, UUID userId) {
        if (!existsByUserIdAndSubscriptionPlanUuid(userId, subscriptionPlanId)) {
            createOrUpdateSubscription(userId, subscriptionPlanId, null, null, SubscriptionStatus.PENDING, null);
        }
        return initAssignedSubscription(subscriptionPlanId, userId);
    }

    @Transactional
    public InitSubscriptionResult initAssignedSubscription(UUID subscriptionPlanId, UUID userId) {
        var hasAnyOpenSubscription = subscriptionRepository.existsByUserIdAndStatusNotIn(userId, List.of(SubscriptionStatus.CANCELED, SubscriptionStatus.PENDING));
        if (hasAnyOpenSubscription) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT, "User already has an open subscription");
        }

        var subscriptionPlanFuture = CompletableFuture.supplyAsync(() -> subscriptionPlanRepository.findByUuid(subscriptionPlanId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Subscription plan not found")), executorService);

        var userDetailsFuture = CompletableFuture.supplyAsync(() -> userServiceFacade.getUserDetails(userId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "User not found")), executorService);

        try {
            CompletableFuture.allOf(subscriptionPlanFuture, userDetailsFuture).join();
            return paymentProviders.get(PaymentGateway.STRIPE).initSubscription(subscriptionPlanFuture.get(), userDetailsFuture.get());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Could not init subscription", e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public Subscription setUpPendingSubscription(UUID subscriptionPlanId, UUID userId) {
        var hasAnyOpenSubscription = subscriptionRepository.existsByUserIdAndStatusNotIn(userId, List.of(SubscriptionStatus.CANCELED, SubscriptionStatus.CANCELLING));
        if (hasAnyOpenSubscription) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT, "User already has an open subscription");
        }
        return createOrUpdateSubscription(userId, subscriptionPlanId, null, null, SubscriptionStatus.PENDING, null);
    }

    public SubscriptionPlan createNewSubscriptionPlan(NewSubscriptionPlanRequest request) {
        var subscriptionPlan = subscriptionMapper.toSubscriptionPlan(request);
        paymentProviders.get(PaymentGateway.STRIPE).createSubscriptionPlan(subscriptionPlan);
        return subscriptionPlanRepository.save(subscriptionPlan);
    }

    @Transactional
    public void cancelSubscription(UUID subscriptionId) {
        var subscriptionEntity = findSubscriptionByUuid(subscriptionId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Subscription not found"));
        if (!AuthUtils.getUserId().equals(subscriptionEntity.getUserId())) {
            throw new HttpClientErrorException(HttpStatus.UNAUTHORIZED);
        }
        if (Set.of(SubscriptionStatus.CANCELED, SubscriptionStatus.CANCELLING).contains(subscriptionEntity.getStatus())) {
            throw new HttpClientErrorException(HttpStatus.CONFLICT, "Subscription already cancelled");
        }
        var newStatus = paymentProviders.get(PaymentGateway.STRIPE).cancelSubscription(subscriptionEntity.getExternalId());
        subscriptionEntity.setStatus(newStatus);
    }

    @Transactional
    public SubscriptionPlan updateSubscriptionPlan(UUID subscriptionPlanId, UpdateSubscriptionPlanData data) {
        //TODO redo - QUEUE/scheduler instead of eager fetch for each update item, at least stripe
        var subscriptionPlan = findSubscriptionPlanByUuidFetchSubscriptions(subscriptionPlanId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Subscription plan not found"));
        paymentProviders.get(PaymentGateway.STRIPE).updateSubscriptionPlan(subscriptionPlan, data);
        return subscriptionPlan;
    }

    public Subscription createOrUpdateSubscription(UUID userId, UUID subscriptionPlanId, String externalId, String currency, SubscriptionStatus status, Instant nextPaymentDate) {
        var subscriptionPlan = subscriptionPlanRepository.findByUuid(subscriptionPlanId)
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Subscription plan not found"));
        var subscription = subscriptionRepository.findByUserIdAndSubscriptionPlanAndStatusNot(userId, subscriptionPlan, SubscriptionStatus.CANCELED)
                .orElseGet(Subscription::new);
        subscription.setStatus(status);
        subscription.setSubscriptionPlan(subscriptionPlan);
        subscription.setExternalId(externalId);
        subscription.setNextPaymentDate(nextPaymentDate != null ? ZonedDateTime.ofInstant(nextPaymentDate, DEFAULT_ZONE_ID) : null);
        subscription.setCurrency(currency);
        subscription.setUserId(userId);
        return subscriptionRepository.save(subscription);
    }

    @Transactional
    public Subscription newSubscriptionPayment(UUID subscriptionId, BigDecimal amount, String currency, PaymentGateway gateway, String gatewayId) {
        return inMemoryLock.tryLockWrap(subscriptionId.toString(), () -> {

            var subscription = subscriptionRepository.findByUuid(subscriptionId)
                    .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND, "Subscription not found"));

            var payment = paymentService.createPayment(CreateNewPaymentData.builder()
                    .amount(amount)
                    .currency(currency)
                    .gateway(gateway)
                    .type(PaymentType.RECURRING)
                    .status(PaymentStatus.CONFIRMED)
                    .userId(subscription.getUserId())
                    .gatewayId(gatewayId)
                    .build());

            var subscriptionHistory = SubscriptionHistory.builder()
                    .amount(amount)
                    .currency(currency)
                    .payment(payment)
                    .build();
            subscriptionHistory.setSubscription(subscription);
            subscription.getSubscriptionHistory().add(subscriptionHistory);

            return subscriptionRepository.save(subscription);
        });
    }

    public void updateSubscriptionStatus(UUID subscriptionId, SubscriptionStatus newStatus) {
        subscriptionRepository.updateSubscriptionStatusByUuid(subscriptionId, newStatus);
    }

    public void updateSubscriptionNextPaymentDate(UUID subscriptionId, Instant nextPaymentDate) {
        subscriptionRepository.updateSubscriptionNextPaymentDateByUuid(subscriptionId, ZonedDateTime.ofInstant(nextPaymentDate, DEFAULT_ZONE_ID));
    }

    @Transactional
    public Subscription addSubscriptionPayment(Subscription subscription) {
        var subHistoryEntry = SubscriptionHistory.builder()
                .subscription(subscription)
                .amount(subscription.getSubscriptionPlan().getPrice())
                .build();
        subscription.getSubscriptionHistory().add(subHistoryEntry);
        return subscriptionRepository.save(subscription);
    }

    @Autowired
    public void setInMemoryLock(CacheService cacheService) {
        this.inMemoryLock = new InMemoryLock(cacheService, "SUBSCRIPTION_LOCK");
    }

    @Autowired
    public void setSubscriptionProviders(List<SubscriptionProvider> subscriptionProviders) {
        this.paymentProviders = subscriptionProviders.stream().collect(Collectors.toMap(SubscriptionProvider::paymentGateway, Function.identity()));
    }

    public List<PlanSubscriptionsCount> countActiveSubscriptionsByPlanUuids(List<UUID> planUuids) {
        return subscriptionRepository.countBySubscriptionPlanInAndStatus(planUuids, SubscriptionStatus.ACTIVE);
    }
}
