package bitecode.modules.ai.model.entity;

import bitecode.modules._common.model.entity.BaseEntity;
import bitecode.modules.ai.model.enums.ChatMessageUserType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(schema = "ai")
public class ChatSessionMessage extends BaseEntity {
    private String message;
    @Column(name = "external_session_id", nullable = false, updatable = false)
    private String externalSessionId;
    @Enumerated(EnumType.STRING)
    private ChatMessageUserType type;
}
