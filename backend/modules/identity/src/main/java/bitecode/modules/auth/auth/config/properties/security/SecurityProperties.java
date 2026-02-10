package bitecode.modules.auth.auth.config.properties.security;

import lombok.Data;
import org.springframework.http.HttpMethod;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
public class SecurityProperties {
    private Map<HttpMethod, List<String>> noAuthUrls = new HashMap<>();
    private String secretKey;
    private long expiration;
}
