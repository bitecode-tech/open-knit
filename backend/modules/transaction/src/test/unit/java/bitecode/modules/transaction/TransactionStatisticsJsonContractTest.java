package bitecode.modules.transaction;

import bitecode.modules.transaction.model.data.TransactionStatistics;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class TransactionStatisticsJsonContractTest {
    private final ObjectMapper objectMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE);

    @Test
    void statisticsResponseUsesCamelCaseKeysConsumedByTheFrontend() throws Exception {
        var response = objectMapper.readTree(objectMapper.writeValueAsString(new TransactionStatistics(8, 5, 3)));

        assertEquals(8, response.path("all").asLong());
        assertEquals(5, response.path("completed").asLong());
        assertEquals(3, response.path("incomplete").asLong());
        assertFalse(response.has("ALL"));
        assertFalse(response.has("COMPLETED"));
        assertFalse(response.has("INCOMPLETE"));
    }
}
