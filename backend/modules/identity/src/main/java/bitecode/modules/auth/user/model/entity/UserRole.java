package bitecode.modules.auth.user.model.entity;

import bitecode.modules._common.model.entity.BaseEntity;
import bitecode.modules.auth.auth.model.entity.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;

@Setter
@Getter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "user_roles", schema = "auth")
public class UserRole extends BaseEntity {
    @Serial
    private static final long serialVersionUID = 1405831511206795912L;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    private Role role;
}
