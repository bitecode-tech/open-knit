package bitecode.modules.payment.subscription.repository;

import bitecode.modules.payment.subscription.model.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findByUuid(UUID planName);

    @EntityGraph(attributePaths = {"subscriptions"})
    @Query("SELECT sp FROM SubscriptionPlan sp where sp.uuid = :id")
    Optional<SubscriptionPlan> findByUuidFetchSubscriptions(UUID id);

    @Query("SELECT sp FROM SubscriptionPlan sp WHERE sp.uuid IN :uuids")
    List<SubscriptionPlan> findAllByUuidIn(List<UUID> uuids);
}
