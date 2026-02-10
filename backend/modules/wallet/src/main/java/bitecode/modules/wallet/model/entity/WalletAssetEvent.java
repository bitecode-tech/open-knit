package bitecode.modules.wallet.model.entity;

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

import java.io.Serial;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(schema = "wallet")
public class WalletAssetEvent extends BaseEntity implements Event {
    @Serial
    private static final long serialVersionUID = -7478508257557389150L;

    private Long walletAssetId;
    private String eventName;
    @Convert(converter = CommandConverter.class)
    @JdbcTypeCode(SqlTypes.JSON)
    private Command eventData;
    private String assetName;
    private BigDecimal totalBefore;
    private BigDecimal totalAmount;
    private BigDecimal totalAfter;
}
