package bitecode.modules.auth.auth.model.entity;

import bitecode.modules._common.model.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serial;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_totp_secret", schema = "auth")
public class TOTPSecret extends BaseEntity {
    @Serial
    private static final long serialVersionUID = 3902874899937714305L;

    private Long userId;
    private String secret;
}
