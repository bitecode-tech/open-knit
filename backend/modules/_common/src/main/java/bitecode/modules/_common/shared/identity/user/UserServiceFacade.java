package bitecode.modules._common.shared.identity.user;

import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserServiceFacade {
    Optional<UserDetails> getUserDetails(UUID userId);

    List<UserDetails> getUserDetails(List<UUID> userId);

    Page<UUID> findAllRegisteredUsersIds(Pageable pageable);
}
