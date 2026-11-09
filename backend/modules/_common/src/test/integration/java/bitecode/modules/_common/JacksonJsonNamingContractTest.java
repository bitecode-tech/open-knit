package bitecode.modules._common;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.web.PagedModel;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class JacksonJsonNamingContractTest extends BaseIntegrationTest {
    @Test
    void applicationObjectMapperReadsAndWritesLowerCamelCase() throws Exception {
        var json = objectMapper.writeValueAsString(new CamelCaseProbe("user-uuid"));

        assertEquals("user-uuid", objectMapper.readTree(json).path("userId").asText());
        assertFalse(objectMapper.readTree(json).has("user_id"));
        assertEquals("user-uuid", objectMapper.readValue("{\"userId\":\"user-uuid\"}", CamelCaseProbe.class).userId());
    }

    @Test
    void applicationObjectMapperSerializesPagedResponseEnvelopeInCamelCase() throws Exception {
        var page = new PagedModel<>(new PageImpl<>(List.of(new CamelCaseProbe("user-uuid")), PageRequest.of(0, 1), 1));
        var json = objectMapper.readTree(objectMapper.writeValueAsString(page));

        assertEquals("user-uuid", json.path("content").get(0).path("userId").asText());
        assertEquals(1, json.path("page").path("size").asInt());
        assertEquals(1, json.path("page").path("totalElements").asInt());
        assertEquals(1, json.path("page").path("totalPages").asInt());
        assertEquals(0, json.path("page").path("number").asInt());
        assertFalse(json.path("page").has("total_elements"));
    }

    public record CamelCaseProbe(String userId) {
    }
}
