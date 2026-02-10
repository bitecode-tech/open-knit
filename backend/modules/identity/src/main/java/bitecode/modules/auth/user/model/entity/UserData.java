package bitecode.modules.auth.user.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(schema = "auth")
public class UserData extends UuidBaseEntity {
    @Serial
    private static final long serialVersionUID = 7609351825510073240L;

    private String name;
    private String surname;

    @OneToOne
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    private User user;
}
