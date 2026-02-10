package bitecode.modules.payment.subscription.repository;

import bitecode.modules.payment.subscription.model.entity.Subscription;
import bitecode.modules.payment.subscription.model.entity.SubscriptionPlan;
import bitecode.modules.payment.subscription.model.enums.SubscriptionStatus;
import bitecode.modules.payment.subscription.model.projection.PlanSubscriptionsCount;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByNextPaymentDateBeforeAndStatus(ZonedDateTime date, SubscriptionStatus status);

    @EntityGraph(attributePaths = {"subscriptionPlan", "subscriptionHistory"})
    List<Subscription> findAllByUserIdIn(List<UUID> userIds);

    @EntityGraph(attributePaths = {"subscriptionPlan", "subscriptionHistory"})
    List<Subscription> findAllByUserIdInAndStatusNotIn(List<UUID> userIds, List<SubscriptionStatus> status);

    boolean existsByUserIdAndStatusNotIn(UUID userId, List<SubscriptionStatus> status);

    boolean existsByUserIdAndSubscriptionPlanUuid(UUID userId, UUID subscriptionPlanId);

    Optional<Subscription> findByUuid(UUID id);

    Optional<Subscription> findByUserIdAndSubscriptionPlanAndStatusNot(UUID userid, SubscriptionPlan plan, SubscriptionStatus status);

    @Transactional
    @Modifying
    @Query("UPDATE Subscription s SET s.status = :status WHERE s.uuid = :id")
    int updateSubscriptionStatusByUuid(UUID id, SubscriptionStatus status);

    @Transactional
    @Modifying
    @Query("UPDATE Subscription s SET s.nextPaymentDate = :nextPaymentDate WHERE s.uuid = :id")
    int updateSubscriptionNextPaymentDateByUuid(UUID id, ZonedDateTime nextPaymentDate);

    @Query("""
              SELECT new bitecode.modules.payment.subscription.model.projection.PlanSubscriptionsCount(s.subscriptionPlan.uuid, count(s))
              FROM Subscription s
              WHERE s.subscriptionPlan.uuid IN :subscriptionPlanIds
                AND s.status = :status
              GROUP BY s.subscriptionPlan.uuid
            """)
    List<PlanSubscriptionsCount> countBySubscriptionPlanInAndStatus(List<UUID> subscriptionPlanIds, SubscriptionStatus status);
}
