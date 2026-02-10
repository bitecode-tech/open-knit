package bitecode.modules.ai.model.data.response;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ChatkitSessionResponse(@JsonProperty("client_secret") String clientSecret) {
}