package bitecode.modules.auth.auth;

import bitecode.modules.auth.auth.model.entity.RefreshToken;
import bitecode.modules.auth.auth.repository.RefreshTokenRepository;
import bitecode.modules.auth.user.model.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class JwtService {

    @Value("${bitecode.security.jwt.secret-key}")
    private String secretKey;

    @Value("${bitecode.security.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${bitecode.security.jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    @Value("${bitecode.security.jwt.short-refresh-token-expiration}")
    private long shortRefreshTokenExpiration;

    private final RefreshTokenRepository refreshTokenRepository;

    public String generateAccessToken(User user) {
        var claims = createGenericClaimsMap(user);
        claims.put("roles", user.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
        return createToken(claims, user.getUsername(), accessTokenExpiration);
    }

    public RefreshToken generateRefreshToken(User user, boolean shortLived) {
        return refreshTokenRepository.findByUsernameAndRevokedFalseAndExpirationTimeGreaterThan(user.getUsername(), Instant.now())
                .orElseGet(() -> {
                    var refreshToken = RefreshToken.builder()
                            .userId(user.getId())
                            .username(user.getUsername())
                            .expirationTime(Instant.now().plus(shortLived ? shortRefreshTokenExpiration : refreshTokenExpiration, ChronoUnit.MINUTES))
                            .revoked(false)
                            .build();
                    return refreshTokenRepository.save(refreshToken);
                });
    }

    public Optional<RefreshToken> validateRefreshToken(UUID refreshTokenId) {
        var refreshTokenOpt = refreshTokenRepository.findByUuid(refreshTokenId);
        return refreshTokenOpt.filter(refreshToken -> !refreshToken.isRevoked() && !refreshToken.getExpirationTime().isBefore(Instant.now()));
    }

    public void revokeRefreshToken(String username) {
        var token = refreshTokenRepository.findByUsernameAndRevokedFalseAndExpirationTimeGreaterThan(username, Instant.now())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.NOT_FOUND));
        token.setRevoked(true);
        refreshTokenRepository.save(token);
    }

    private Map<String, Object> createGenericClaimsMap(User user) {
        var map = new HashMap<String, Object>();
        map.put("uuid", user.getUuid());
        map.put("email", user.getEmail());
        return map;
    }

    private String createToken(Map<String, Object> claims, String username, long expirationTime) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSignKey())
                .compact();
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            Claims claims = decodeToken(token);
            String username = claims.getSubject();
            Date expirationDate = claims.getExpiration();

            return username.equals(userDetails.getUsername()) && !expirationDate.before(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    public Claims decodeToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSignKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            throw new AuthorizationDeniedException("Invalid token");
        }
    }

    public boolean isTokenExpired(Claims claims) {
        return claims.getExpiration().before(new Date());
    }

    public String extractUsername(Claims token) {
        return token.getSubject();
    }

    public Date extractExpiration(Claims token) {
        return token.getExpiration();
    }


    private SecretKey getSignKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }
}
