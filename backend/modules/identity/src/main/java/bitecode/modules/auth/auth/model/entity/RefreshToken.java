package bitecode.modules.auth.auth.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

import java.io.Serial;
import java.time.Instant;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_refresh_token", schema = "auth")
public class RefreshToken extends UuidBaseEntity {
    @Serial
    private static final long serialVersionUID = 7205473533557342812L;

    private Long userId;
    private String username;
    private Instant expirationTime;
    private boolean revoked;
}
