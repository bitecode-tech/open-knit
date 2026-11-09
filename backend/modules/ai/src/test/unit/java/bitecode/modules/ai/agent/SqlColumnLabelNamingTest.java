package bitecode.modules.ai.agent;

import org.junit.jupiter.api.Test;

import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;

class SqlColumnLabelNamingTest {
    @Test
    void convertsDatabaseColumnLabelsToCamelCaseForInternalJson() {
        assertEquals("createdDate", SqlColumnLabelNaming.toCamelCase("created_date"));
        assertEquals("createdDate", SqlColumnLabelNaming.toCamelCase("createdDate"));
        assertEquals("userId", SqlColumnLabelNaming.toCamelCase("USER_ID"));
        assertEquals("user", SqlColumnLabelNaming.toCamelCase("USER"));
        assertEquals("displayName", SqlColumnLabelNaming.toCamelCase("display-name"));
    }

    @Test
    void addsJdbcValuesToDatasetRowsUsingCamelCaseKeys() {
        var datasetRow = new HashMap<String, Object>();

        SqlColumnLabelNaming.putInCamelCase(datasetRow, "created_date", "2026-11-09");

        assertEquals("2026-11-09", datasetRow.get("createdDate"));
        assertEquals(1, datasetRow.size());
    }
}
