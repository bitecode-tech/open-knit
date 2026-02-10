package bitecode.modules.auth.auth.config.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@ConditionalOnProperty(name = "logging.level.bitecode.modules", havingValue = "DEBUG")
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        if (request.getRequestURI().startsWith("/actuator/health")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (log.isDebugEnabled()) {
            String timestamp = java.time.LocalDateTime.now().toString();
            String endpoint = request.getRequestURI();
            String method = request.getMethod();
            String clientIp = request.getRemoteAddr();

            log.debug("{}|{}|{}|{}", method, endpoint, timestamp, clientIp);
        }

        filterChain.doFilter(request, response);
    }
}