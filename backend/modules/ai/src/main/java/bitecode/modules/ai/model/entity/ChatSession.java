package bitecode.modules.ai.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(schema = "ai")
public class ChatSession extends UuidBaseEntity {
    private UUID userId;
    private String lastResponseId;

    @Column(name = "external_session_id", nullable = false, updatable = false)
    private String externalSessionId;
    private UUID agentId;

    @Builder.Default
    @OneToMany
    @JoinColumn(name = "external_session_id", referencedColumnName = "external_session_id", insertable = false, updatable = false)
    private List<ChatSessionMessage> messages = new ArrayList<>();
}
