package bitecode.modules.payment.payment.provider.stripe.model;

import bitecode.modules._common.model.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serial;
import java.util.UUID;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "stripe_customer", schema = "payment")
public class StripeCustomer extends BaseEntity {
    @Serial
    private static final long serialVersionUID = -2622504389391333254L;
    private UUID userId;
    private String stripeCustomerId;
}
