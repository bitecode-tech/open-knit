package bitecode.modules.auth.user.admin;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import bitecode.modules.auth.user.admin.model.request.InviteUserRequest;
import bitecode.modules.auth.user.model.data.FindUsersCriteria;
import bitecode.modules.auth.user.model.mapper.UserMapper;
import io.jsonwebtoken.lang.Collections;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@AdminAccess
@RequestMapping("/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;
    private final UserMapper userMapper;

    @GetMapping("/statistics")
    public Map<String, Long> getRequestFiltersTotalElems() {

        return adminUserService.getFiltersTotalElemsCount();
    }

    @GetMapping
    public PagedModel<UserDetails> getUsers(Pageable pageable, @ModelAttribute FindUsersCriteria userCriteria) {
        if (pageable == null && userCriteria != null && !Collections.isEmpty(userCriteria.userIds())) {
            var userIds = userCriteria.userIds();
            pageable = PageRequest.of(0, userIds.size());
        }

        var page = adminUserService.findByCriteria(pageable, userCriteria)
                .map(userMapper::toUserDetails);
        return new PagedModel<>(page);
    }

    @PostMapping("/invite")
    public void inviteUser(@Valid @RequestBody InviteUserRequest request) {
        adminUserService.createAndInviteUser(request);
    }
}

