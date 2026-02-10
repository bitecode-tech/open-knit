package bitecode.modules.wallet.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.*;

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
public class WalletAsset extends UuidBaseEntity {
    @Serial
    private static final long serialVersionUID = 6980500742486508457L;
    private String userId;
    @JsonIgnore
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    private Wallet wallet;
    private String name;
    private BigDecimal totalAmount;
    private BigDecimal holdAmount;
}
