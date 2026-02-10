package bitecode.modules.auth.user.repository;

import bitecode.modules.auth.user.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, CustomUserRepository {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "roles.role"})
    Optional<User> findUserByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "roles.role", "userData"})
    @Query("SELECT u FROM User u where u.uuid = :uuid")
    Optional<User> findByUuidWithUserData(UUID uuid);

    Optional<User> findByUuid(UUID uuid);

    @EntityGraph(attributePaths = {"roles", "roles.role"})
    Optional<User> findById(Long id);

    @EntityGraph(attributePaths = {"roles", "roles.role", "userData"})
    @Query("SELECT u FROM User u")
    Page<User> findAllWithRolesAndDetails(Pageable pageable);

    @EntityGraph(attributePaths = {"roles", "roles.role", "userData"})
    @Query("SELECT u FROM User u where u.uuid in :userIds")
    List<User> findAllByUuidInWithUserData(List<UUID> userIds);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.password = :newPassword WHERE u.email = :email")
    int updatePasswordByEmail(String email, String newPassword);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.emailConfirmed = true WHERE u.email = :email")
    int updateEmailConfirmedByEmail(String email);

    long countByEmailConfirmedIs(boolean emailConfirmed);

    @Query("SELECT u.uuid FROM User u WHERE u.emailConfirmed = :emailConfirmed")
    Page<UUID> findAllByEmailConfirmed(Pageable pageable, boolean emailConfirmed);
}
