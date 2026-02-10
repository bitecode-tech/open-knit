package bitecode.modules.auth.auth.model.entity;

import bitecode.modules._common.model.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Cacheable;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

import java.io.Serial;

@Entity
@Getter
@Setter
@Table(name = "role", schema = "auth")
@Cacheable
public class Role extends BaseEntity implements GrantedAuthority {
    @Serial
    private static final long serialVersionUID = 6807798534610365588L;
    private String name;

    @JsonIgnore
    @Override
    public String getAuthority() {
        return name;
    }
}
