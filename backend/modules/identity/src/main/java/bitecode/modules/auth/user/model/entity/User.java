package bitecode.modules.auth.user.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import bitecode.modules._common.shared.identity.user.model.PrincipalDetails;
import bitecode.modules.auth.auth.model.enums.MfaMethod;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;

import java.io.Serial;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "\"user\"", schema = "auth")
public class User extends UuidBaseEntity implements PrincipalDetails {
    @Serial
    private static final long serialVersionUID = 7786253430947412177L;

    private String email;
    private String password;
    @Builder.Default
    private boolean emailConfirmed = false;
    @Builder.Default
    private boolean mfaEnabled = false;

    @Enumerated(EnumType.STRING)
    private MfaMethod mfaMethod;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    @ToString.Exclude
    private Set<UserRole> roles = new HashSet<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private UserData userData;

    @Version
    private Long version;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream().map(UserRole::getRole).toList();
    }

    @Override
    public String getUsername() {
        return email;
    }
}
