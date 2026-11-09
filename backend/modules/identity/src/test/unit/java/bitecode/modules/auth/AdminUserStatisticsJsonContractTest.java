package bitecode.modules.auth;

import bitecode.modules.auth.user.admin.model.response.AdminUserStatistics;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class AdminUserStatisticsJsonContractTest {
    private final ObjectMapper objectMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE);

    @Test
    void statisticsResponseUsesCamelCaseKeysConsumedByTheFrontend() throws Exception {
        var response = objectMapper.readTree(objectMapper.writeValueAsString(new AdminUserStatistics(8, 5, 3)));

        assertEquals(8, response.path("all").asLong());
        assertEquals(5, response.path("registrationCompleted").asLong());
        assertEquals(3, response.path("registrationIncomplete").asLong());
        assertFalse(response.has("REGISTRATION_COMPLETED"));
        assertFalse(response.has("REGISTRATION_INCOMPLETE"));
    }
}
