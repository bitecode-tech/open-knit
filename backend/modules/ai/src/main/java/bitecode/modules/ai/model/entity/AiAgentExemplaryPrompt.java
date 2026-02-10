package bitecode.modules.ai.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
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
public class AiAgentExemplaryPrompt extends UuidBaseEntity {
    private String prompt;

    @JsonIgnore
    @ToString.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    private AiAgent aiAgent;
}
