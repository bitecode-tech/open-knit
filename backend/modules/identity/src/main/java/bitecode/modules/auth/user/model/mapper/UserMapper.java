package bitecode.modules.auth.user.model.mapper;

import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import bitecode.modules.auth.user.model.entity.User;
import bitecode.modules.auth.user.model.entity.UserRole;
import bitecode.modules.auth.user.model.request.SignUpRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.ReportingPolicy;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        uses = {UserDataMapper.class}
)
public interface UserMapper {

    @Mapping(target = "emptyPassword", expression = "java(user.getPassword() == null)")
    UserDetails toUserDetails(User user);

    User toUser(SignUpRequest request);

    default Set<String> mapUserRoles(Set<UserRole> userRoles) {
        return userRoles.stream()
                .map(userRole -> userRole.getRole().getName())
                .collect(Collectors.toSet());
    }
}