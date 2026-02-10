package bitecode.modules.payment.subscription.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import bitecode.modules.payment.subscription.model.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(schema = "payment")
public class Subscription extends UuidBaseEntity {
    @Serial
    private static final long serialVersionUID = 3603682779277747767L;

    private UUID userId;
    private String currency;
    private String externalId;
    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status;
    private ZonedDateTime nextPaymentDate;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private SubscriptionPlan subscriptionPlan;

    @Builder.Default
    @OrderBy("id DESC")
    @OneToMany(mappedBy = "subscription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SubscriptionHistory> subscriptionHistory = new ArrayList<>();
}
