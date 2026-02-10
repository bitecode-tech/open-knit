package bitecode.modules.payment.payment.provider.stripe;

import bitecode.modules.payment.payment.provider.stripe.model.StripeCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StripeCustomerRepository extends JpaRepository<StripeCustomer, Long> {
    Optional<StripeCustomer> findByUserId(UUID userId);
}
