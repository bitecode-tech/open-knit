package bitecode.modules.auth.user;

import bitecode.modules._common.shared.identity.user.UserServiceFacade;
import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import bitecode.modules.auth.user.model.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceFacadeImpl implements UserServiceFacade {
    private final UserService userService;
    private final UserMapper userMapper;

    @Override
    public Optional<UserDetails> getUserDetails(UUID userId) {
        return userService.findUserByUuidFetchUserData(userId)
                .map(userMapper::toUserDetails);
    }

    @Override
    public List<UserDetails> getUserDetails(List<UUID> userIds) {
        return userService.findAllByUuidInWithDetails(userIds)
                .stream()
                .map(userMapper::toUserDetails)
                .toList();
    }

    @Override
    public Page<UUID> findAllRegisteredUsersIds(Pageable pageable) {
        return userService.findAllRegisteredUsers(pageable);
    }
}
