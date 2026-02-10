package bitecode.modules.ai.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(schema = "ai")
public class AiServicesProviderConfig extends UuidBaseEntity {
    @Enumerated(EnumType.STRING)
    private AiServicesProviderType provider;
    private String apiKey;
}
