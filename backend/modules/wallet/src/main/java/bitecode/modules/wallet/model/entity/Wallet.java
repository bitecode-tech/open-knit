package bitecode.modules.wallet.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serial;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(schema = "wallet")
public class Wallet extends UuidBaseEntity {
    @Serial
    private static final long serialVersionUID = -8836576340044346274L;

    private String userId;
    @Builder.Default
    @OneToMany(mappedBy = "wallet")
    private List<WalletAsset> assets = new ArrayList<>();
    private boolean frozen;
}
