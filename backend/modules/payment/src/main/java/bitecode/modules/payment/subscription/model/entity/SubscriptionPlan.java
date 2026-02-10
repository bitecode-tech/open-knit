package bitecode.modules.payment.subscription.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import bitecode.modules.payment.payment.model.data.StripeParams;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serial;
import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(schema = "payment")
public class SubscriptionPlan extends UuidBaseEntity {
    @Serial
    private static final long serialVersionUID = -8132898277742065350L;
    private String name;
    private BigDecimal price;
    private String currency;
    @Enumerated(EnumType.STRING)
    private ChronoUnit paymentFrequencyType;
    private Long paymentFrequency;

    //TODO more generic in case of multiple providers
    @JdbcTypeCode(SqlTypes.JSON)
    private StripeParams params;

    @JsonIgnore
    @ToString.Exclude
    @OneToMany(mappedBy = "subscriptionPlan", cascade = CascadeType.ALL)
    private List<Subscription> subscriptions;
}



