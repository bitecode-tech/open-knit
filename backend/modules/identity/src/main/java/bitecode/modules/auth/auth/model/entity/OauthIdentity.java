package bitecode.modules.auth.auth.model.entity;

import bitecode.modules.auth.user.model.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "oauth_identity", schema = "auth", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider", "providerUserId"})
})
public class OauthIdentity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String provider;
    private String providerUserId;
    private String email;

    private Instant createdDate;
    private Instant updatedDate;
} 