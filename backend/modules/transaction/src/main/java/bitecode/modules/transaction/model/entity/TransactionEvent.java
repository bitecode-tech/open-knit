package bitecode.modules.transaction.model.entity;

import bitecode.modules._common.eventsourcing.converter.CommandConverter;
import bitecode.modules._common.eventsourcing.model.Command;
import bitecode.modules._common.eventsourcing.model.Event;
import bitecode.modules._common.model.entity.BaseEntity;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
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
@Table(schema = "transaction")
public class TransactionEvent extends BaseEntity implements Event {
    private Long transactionId;
    private String eventName;

    @Convert(converter = CommandConverter.class)
    @JdbcTypeCode(SqlTypes.JSON)
    private Command eventData;
}
