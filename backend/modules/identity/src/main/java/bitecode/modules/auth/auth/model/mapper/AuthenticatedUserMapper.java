package bitecode.modules.auth.auth.model.mapper;

import bitecode.modules.auth.auth.model.data.AuthenticatedUserDetails;
import bitecode.modules.auth.auth.model.response.RefreshTokenResponse;
import bitecode.modules.auth.auth.model.response.SignInResponse;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AuthenticatedUserMapper {

    SignInResponse toSignInResponse(AuthenticatedUserDetails userDetails);

    RefreshTokenResponse toRefreshTokenResponse(AuthenticatedUserDetails userDetails);
}