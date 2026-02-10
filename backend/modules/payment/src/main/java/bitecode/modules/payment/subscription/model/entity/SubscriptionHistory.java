package bitecode.modules.payment.subscription.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import bitecode.modules.payment.payment.model.entity.Payment;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(schema = "payment")
public class SubscriptionHistory extends UuidBaseEntity {
    @Serial
    private static final long serialVersionUID = -8132898277742065350L;
    private BigDecimal amount;
    private String currency;

    @JsonIgnore
    @ToString.Exclude
    @ManyToOne(cascade = CascadeType.ALL)
    private Subscription subscription;

    @JsonIgnore
    @ToString.Exclude
    @OneToOne(fetch = FetchType.LAZY)
    private Payment payment;
}



