package bitecode.modules.auth.auth.admin;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules.auth.auth.AuthController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AdminAccess
@RequestMapping("/admin" + AuthController.PATH_MAPPING)
@RequiredArgsConstructor
public class AdminAuthController {
    private final AdminAuthService adminAuthService;

    @DeleteMapping("/tokens/refresh")
    public void revokeToken(@RequestParam String username) {
        adminAuthService.revokeRefreshToken(username);
    }
}
