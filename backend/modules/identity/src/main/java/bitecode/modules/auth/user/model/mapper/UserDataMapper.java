package bitecode.modules.auth.user.model.mapper;

import bitecode.modules._common.shared.identity.user.model.data.UserDataDetails;
import bitecode.modules.auth.user.model.entity.UserData;
import bitecode.modules.auth.user.model.request.UpdateUserDataRequest;
import org.mapstruct.*;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserDataMapper {

    UserDataDetails toUserDataDetails(UserData userData);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void patchUserFromRequest(UpdateUserDataRequest request, @MappingTarget UserData userData);
}