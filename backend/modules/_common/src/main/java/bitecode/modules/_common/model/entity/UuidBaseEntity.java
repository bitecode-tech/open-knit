package bitecode.modules._common.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
public abstract class UuidBaseEntity extends BaseEntity {
    @Column(nullable = false, unique = true, updatable = false)
    private UUID uuid;

    public UuidBaseEntity() {
        this.uuid = UUID.randomUUID();
    }
}
