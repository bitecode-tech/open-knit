package bitecode.modules.ai.model.entity;

import bitecode.modules._common.model.entity.UuidBaseEntity;
import bitecode.modules.ai.model.enums.AiChatUi;
import bitecode.modules.ai.model.enums.AiServicesProviderType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.SQLRestriction;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(schema = "ai")
public class AiAgent extends UuidBaseEntity {
    private String name;
    private String title;
    private String systemMessage;
    private String inputPlaceholder;
    @Enumerated(EnumType.STRING)
    private AiServicesProviderType provider;
    private String model;
    private String visionModel;
    private String recordingModel;
    private String strategyName;
    @Builder.Default
    @Enumerated(EnumType.STRING)
    private AiChatUi chatUi = AiChatUi.DEFAULT;
    private String chatkitWorkflowId;
    @Builder.Default
    private Boolean testMode = false;
    @Builder.Default
    private Boolean deleted = false;
    private String accessPassword;
    @Builder.Default
    private Boolean accessPasswordEnabled = false;
    private Double temperature;
    @Column(name = "top_p")
    private Double topP;
    private Integer maxTokens;
    private Double presencePenalty;
    private Double frequencyPenalty;
    private Integer shortTermMemoryLastMessages;
    @Builder.Default
    private Boolean fileUploadEnabled = true;
    @Builder.Default
    private Boolean recordingEnabled = false;

    @ToString.Exclude
    @Builder.Default
    @SQLRestriction("deleted = false")
    @OneToMany(mappedBy = "aiAgent", cascade = CascadeType.ALL)
    @BatchSize(size = 100) // easy fix for fetch multiple bags err
    private List<VectorDocumentRef> documents = new ArrayList<>();

    @ToString.Exclude
    @Builder.Default
    @OneToMany(mappedBy = "aiAgent", cascade = CascadeType.ALL, orphanRemoval = true)
    @BatchSize(size = 100)
    private List<AiAgentExemplaryPrompt> exemplaryPrompts = new ArrayList<>();
}
