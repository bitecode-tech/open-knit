package bitecode.modules.payment.payment.model.entity;

import bitecode.modules._common.model.entity.BaseEntity;
import bitecode.modules.payment.payment.model.enums.PaymentUpdateType;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(schema = "payment")
public class PaymentHistory extends BaseEntity {
    @Enumerated(EnumType.STRING)
    private PaymentUpdateType updateType;
    @JdbcTypeCode(SqlTypes.JSON)
    private String updateData;
    private Boolean applied; // did we update our data with the request

    @JsonIgnore
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    private Payment payment;
}
