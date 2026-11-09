package bitecode.modules.demo;

import bitecode.modules.ai.model.data.request.ChatkitSessionRequest;
import bitecode.modules.ai.model.data.response.ChatkitSessionResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class ChatkitJsonNamingContractTest {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void chatkitEndpointDtosUseCamelCaseForTheInternalHttpBoundary() throws Exception {
        var requestJson = objectMapper.writeValueAsString(new ChatkitSessionRequest("secret", "user", "workflow"));
        var responseJson = objectMapper.writeValueAsString(new ChatkitSessionResponse("secret"));

        assertEquals("secret", objectMapper.readTree(requestJson).get("clientSecret").asText());
        assertEquals("workflow", objectMapper.readTree(requestJson).get("workflowId").asText());
        assertFalse(objectMapper.readTree(requestJson).has("client_secret"));
        assertFalse(objectMapper.readTree(requestJson).has("workflow_id"));
        assertEquals("secret", objectMapper.readTree(responseJson).get("clientSecret").asText());
        assertFalse(objectMapper.readTree(responseJson).has("client_secret"));
    }
}
