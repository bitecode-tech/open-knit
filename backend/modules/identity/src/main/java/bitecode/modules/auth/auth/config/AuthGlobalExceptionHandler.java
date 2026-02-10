package bitecode.modules.auth.auth.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class AuthGlobalExceptionHandler {

    @ExceptionHandler({BadCredentialsException.class, AuthorizationDeniedException.class})
    public ResponseEntity<Map<String, Object>> handleAuthenticationException(RuntimeException ex) {
        log.debug("@RestControllerAdvice handleAuthenticationException error:", ex);
        Map<String, Object> errorResponse = new HashMap<>();
        var status = HttpStatus.UNAUTHORIZED;
        if (ex instanceof AuthorizationDeniedException) {
            status = HttpStatus.FORBIDDEN;
        }
        errorResponse.put("error", status.getReasonPhrase());

        return ResponseEntity
                .status(status)
                .body(errorResponse);
    }
}
