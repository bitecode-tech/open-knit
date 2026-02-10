package bitecode.modules.payment.payment.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import bitecode.modules.payment.subscription.model.entity.SubscriptionHistory;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(schema = "payment")
public class Payment extends UuidBaseEntity {
    private UUID userId;
    private UUID transactionId;
    private BigDecimal amount;
    private String currency;
    private String gatewayId;
    @Enumerated(EnumType.STRING)
    private PaymentGateway gateway;
    @Enumerated(EnumType.STRING)
    private PaymentStatus status;
    @Enumerated(EnumType.STRING)
    private PaymentType type;

    @OrderBy("id DESC")
    @Builder.Default
    @OneToMany(mappedBy = "payment")
    private List<PaymentHistory> paymentHistoryList = new ArrayList<>();

    @OrderBy("id DESC")
    @OneToOne(mappedBy = "payment")
    private SubscriptionHistory subscriptionHistory;
}
