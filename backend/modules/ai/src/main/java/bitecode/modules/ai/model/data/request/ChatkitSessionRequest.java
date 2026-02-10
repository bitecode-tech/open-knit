package bitecode.modules.ai.model.data.request;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ChatkitSessionRequest(
        @JsonProperty("client_secret") String clientSecret,
        @JsonProperty("user") String user,
        @JsonProperty("workflow_id") String workflowId
) {
}