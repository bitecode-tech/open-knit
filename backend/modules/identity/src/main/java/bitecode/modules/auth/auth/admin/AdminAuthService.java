package bitecode.modules.auth.auth.admin;

import bitecode.modules.auth.auth.JwtService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AdminAuthService {
    private final JwtService jwtService;

    public void revokeRefreshToken(String username) {
        jwtService.revokeRefreshToken(username);
    }
}
