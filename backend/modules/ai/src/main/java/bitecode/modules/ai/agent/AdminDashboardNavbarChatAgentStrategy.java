package bitecode.modules.ai.agent;

import bitecode.modules.ai.agent.data.AiAgentChatResponseData;
import bitecode.modules.ai.agent.data.AiAgentRequestData;
import bitecode.modules.ai.agent.data.DatabaseQueryDeducingAgentCallAnswer;
import bitecode.modules.ai.agent.data.UserChatResponse;
import bitecode.modules.ai.agent.provider.ChatProviderBuilder;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.service.AiServicesProviderConfigService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mysema.commons.lang.Pair;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSetMetaData;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminDashboardNavbarChatAgentStrategy implements AiAgentStrategy {
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final AiServicesProviderConfigService providerConfigService;
    private final ChatProviderBuilder chatProviderBuilder;
    private String dbSchemaContext;
    private String dbSchemaTableList;

    @Value("classpath:db/migration/auth/V1__auth_schema.sql")
    private Resource authSchema;
    @Value("classpath:db/migration/payment/V1__payment.sql")
    private Resource paymentSchema;
    @Value("classpath:db/migration/transaction/V1__transaction_schema.sql")
    private Resource transactionSchema;
    @Value("classpath:db/migration/wallet/V1__wallet_schema.sql")
    private Resource walletSchema;
    @Value("classpath:db/migration/ai/V1__ai_schema.sql")
    private Resource aiSchema;

    @Override
    public String name() {
        return "AdminDashboardNavbarChatAgent";
    }

    @PostConstruct
    public void loadDbSchemaContext() {
        var schemaBuilder = new StringBuilder();
        var prefixedTableListBuilder = new StringBuilder();
        Stream.of(Pair.of(authSchema, "auth"),
                        Pair.of(paymentSchema, "payment"),
                        Pair.of(transactionSchema, "transaction"),
                        Pair.of(walletSchema, "wallet"),
                        Pair.of(aiSchema, "ai")
                )
                .map(this::readResource)
                .forEach(schemaPair -> {
                    var schema = schemaPair.getFirst();
                    var prefix = schemaPair.getSecond();
                    schemaBuilder.append(schema).append("\n");
                    prefixedTableListBuilder.append(extractTableNames(schema, prefix)).append("\n");
                });

        dbSchemaContext = schemaBuilder.toString();
        dbSchemaTableList = prefixedTableListBuilder.toString();
        if (log.isDebugEnabled()) {
            log.debug("Available tables: {}", dbSchemaTableList);
        }
    }

    public AiAgentChatResponseData message(AiAgent aiAgent, AiAgentRequestData data) {
        var prompt = data.getMessage();
        var chatProviderConfig = chatProviderBuilder.buildClientConfig(providerConfigService.findProvider(aiAgent.getProvider())
                .orElseThrow(() -> new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Missing AI services provider config")));
        var apiKey = chatProviderConfig.apiKey();

        var chatClient = OpenAiChatModel.builder()
                .openAiApi(OpenAiApi.builder().apiKey(apiKey).build())
                .build();
        try {
            var responseBuilder = UserChatResponse.builder();
            var agentAnswer = queryDeducingAgentCall(chatClient, prompt);

            if (agentAnswer.error() != null) {
                return responseBuilder.error(agentAnswer.error()).build();
            }

            var queryResp = executeQuery(agentAnswer.query());

            if (agentAnswer.requiresDefiniteAnswer() || queryResp.isEmpty()) {
                var reasoningAnswer = reasoningAnswerAgentCall(chatClient, prompt, agentAnswer.query(), queryResp);
                return responseBuilder.message(reasoningAnswer).build();
            }

            return responseBuilder.dataset(queryResp).build();
        } catch (Exception e) {
            log.error("Could not execute prompt", e);
            return UserChatResponse.builder().error("Could not execute prompt: " + e.getMessage()).build();
        }
    }

    private DatabaseQueryDeducingAgentCallAnswer queryDeducingAgentCall(OpenAiChatModel chatClient, String prompt) throws JsonProcessingException {
        var systemPrompt = """
                You are an AI assistant specialized in generating safe, paginated, read-only SQL SELECT queries for a PostgreSQL database.
                 You are strictly forbidden from creating, updating, deleting, or modifying any data.
                         
                 **Schema Context:**
                 You have access to the following database schemas and their respective tables including column names and data types:
                 %s
                                
                **Guidelines:**
                1. **Schema Prefixes:**
                   - **All** table names **must** be prefixed with their respective schema names. For example:
                     - To query the `user` table in the `auth` schema: `auth.user`
                     - To query the `subscription` table in the `payment` schema: `payment.subscription`
                   - **Never** omit the schema prefix. For example, use `transaction.transaction` instead of just `transaction`.
                   - List of all PREFIXED tables: %s
                   
                2. **Sensitive Columns:**
                   - **Do not** include the following sensitive or confidential columns in any `SELECT` queries:
                     - `password`
                     - `api_key`
                     - `token`
                     - `secret`
                   - If a user requests data that would require accessing these columns, **do not** include them. Instead, adjust the query to exclude these fields or respond with an appropriate error message.              
                                
                3. **Query Structure:**
                   - **Only** generate `SELECT` statements. **Do not** generate `CREATE`, `UPDATE`, `DELETE`, or any other SQL commands.
                   - **Ensure** that queries are safe and do not expose sensitive information.
                                
                4. **Join Logic:**
                   - When generating `JOIN` operations between tables, adhere to the following steps:
                     1. **Identify Potential Join Columns:**
                        - Look for columns with related or matching names, such as:
                          - `user_id` ↔ `auth.user.uuid`
                          - `payment_id` ↔ `payment.payment_method.uuid`
                          - `transaction_id` ↔ `transaction.transaction.uuid`
                          - *(Add other relevant foreign key relationships as defined in the schema)*
                     2. **Verify Data Type Compatibility:**
                        - **Only** perform the `JOIN` if the columns being joined have **compatible data types**. For example:
                          - `UUID` ↔ `UUID`
                          - `BIGINT` ↔ `BIGINT`
                          - `INTEGER` ↔ `INTEGER`
                        - **Do not** perform `JOINs` between columns with mismatched data types, such as:
                          - `UUID` ↔ `VARCHAR`
                          - `BIGINT` ↔ `NUMERIC`
                     3. **Use Primary and Foreign Keys Appropriately:**
                        - **Prefer** joining a foreign key to the corresponding primary key of another table. For example:
                          - `transaction.user_id` (UUID) should join to `auth.user.uuid` (UUID)
                     4. **Examples:**
                        - **Correct Join:**
                          ```sql
                          JOIN auth.user ON transaction.transaction.user_id = auth.user.uuid
                          ```
                        - **Incorrect Join:**
                          ```sql
                          JOIN auth.user ON transaction.transaction.user_id = auth.user.email
                          ```
                          *(Error: Data types do not match - `UUID` vs `VARCHAR`)*
                   - **Never** assume a `JOIN` is possible if data types are incompatible or columns are unrelated.
                   
                5. **Pagination:**
                   - **By default**, limit the number of returned records to **50** unless the user explicitly specifies a different limit.
                   - If the user requests a specific number of records or a different pagination strategy, follow their instructions accordingly.
                                
                6. **Response Format:**
                   - **Always** respond with a JSON object containing two fields:
                     - `"query"`: A single-line SQL `SELECT` statement with proper schema prefixes.
                     - `"error"`: Optional string field, filled only in case of error, otherwise null
                     - `"requires_definite_answer"`: A boolean indicating whether the user expects a specific, concise answer suitable for direct human interpretation, rather than a detailed dataset or list of records.
                        - **`true`**: The user seeks a straightforward, human-readable response (e.g., "There are 2 active subscriptions").
                        - **`false`**: The user expects a dataset or list of objects that can be displayed in a table or similar format on the frontend.
                        
                     - response object as follows:
                        {
                            "query": string,
                            "error": string | null,
                            "requires_definite_answer": boolean
                        }
                     
                 7. **Error Handling:**
                    - If the user's request cannot be fulfilled due to schema or table ambiguities, **do not** generate a query. Instead, respond with an appropriate error message within the JSON object.
                 
                 8. **Additional Instructions:**
                    - **Do not** include comments, explanations, or any additional text outside the JSON response. 
                    - **do not** include ```json``` wrapper in the response
                    - the response HAS to contain ONLY plain json
                    - **Ensure** that the entire SQL query is contained within a single line to maintain consistency and avoid parsing issues.
                    - **Answer Only Data-Related Questions**: If the user's request is not related to data querying or business logic, or if you can't generate an appropriate query, return that information in the `"error"` field with an explanation of why, and possibly suggest what the user should do to rectify the issue.
                    - **do not** include sensitive, confidential, health, classified data in the query (like passwords, tokens, api keys).
                     
                                
                **Task:**
                Utilize the above schema context and guidelines to generate precise and correctly formatted SQL `SELECT` queries based on the user's natural language requests.
                                
                """.formatted(dbSchemaContext, dbSchemaTableList);
        var userPrompt = "User request: " + prompt;
        var fullPrompt = systemPrompt + "\n" + userPrompt;

        var queryDeducingAnswer = chatClient.call(new Prompt(fullPrompt)).getResult().getOutput().getText();

        if (log.isDebugEnabled()) {
            log.debug(queryDeducingAnswer);
        }

        return objectMapper.readValue(queryDeducingAnswer, DatabaseQueryDeducingAgentCallAnswer.class);
    }

    private List<Map<String, Object>> executeQuery(String sql) {
        if (!isSelectQuery(sql)) {
            throw new IllegalArgumentException("Only SELECT queries are allowed.");
        }
        List<List<Map<String, Object>>> rows = jdbcTemplate.query(sql, (rs) -> {
            List<List<Map<String, Object>>> result = new ArrayList<>();
            ResultSetMetaData metaData = rs.getMetaData();
            int colCount = metaData.getColumnCount();
            while (rs.next()) {
                Map<String, Object> rowMap = new HashMap<>();
                for (int i = 1; i <= colCount; i++) {
                    String colName = metaData.getColumnLabel(i);
                    rowMap.put(colName, rs.getObject(i));
                }
                List<Map<String, Object>> rowList = new ArrayList<>();
                rowList.add(rowMap);
                result.add(rowList);
            }
            return result;
        });

        return rows.stream()
                .flatMap(List::stream)
                .collect(Collectors.toList());
    }

    private boolean isSelectQuery(String sql) {
        return sql != null && sql.trim().toLowerCase().startsWith("select");
    }

    private String reasoningAnswerAgentCall(OpenAiChatModel chatClient, String originalPrompt, String sqlQuery, List<Map<String, Object>> queryResult) {
        String queryResultJson;
        try {
            queryResultJson = objectMapper.writeValueAsString(queryResult);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize query results for reasoning", e);
            return "Unable to generate a reasoning answer due to data processing issues.";
        }

        var reasoningPrompt = """
                You are an AI assistant that provides human-readable answers based on database query results.
                                
                **Original User Question:** %s
                **SQL Query Executed:** %s
                **Query Results:** %s
                                
                **Task:** 
                Analyze the query results and provide a clear, concise, and human-readable answer to the original question.
                Focus on the key insights and provide a definitive answer rather than just listing data.
                                
                **Guidelines:**
                - Be conversational and natural in your response
                - Highlight the most important findings
                - If the results are empty, explain what that means in context
                - If there are multiple results, summarize the key points
                - Keep the answer focused and relevant to the original question
                                
                **Response:** Provide only the reasoning answer, no additional formatting or explanations.
                """.formatted(originalPrompt, sqlQuery, queryResultJson);

        try {
            var reasoningResponse = chatClient.call(new Prompt(reasoningPrompt)).getResult().getOutput().getText();
            return reasoningResponse.trim();
        } catch (Exception e) {
            log.error("Failed to generate reasoning answer", e);
            return "Unable to generate a reasoning answer at this time.";
        }
    }

    private String extractTableNames(String schemaContent, String schemaPrefix) {
        List<String> tableNames = new ArrayList<>();
        Pattern pattern = Pattern.compile("CREATE\\s+TABLE\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?(?:\\\"?([^\\\"\\s]+)\\\"?\\s*\\.\\s*)?\\\"?([^\\\"\\s(]+)\\\"?", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(schemaContent);

        while (matcher.find()) {
            String tableName = matcher.group(2);
            if (tableName != null && !tableName.trim().isEmpty()) {
                tableNames.add(schemaPrefix + "." + tableName.trim());
            }
        }

        return String.join(", ", tableNames);
    }

    private Pair<String, String> readResource(Pair<Resource, String> resource) {
        try (var reader = new BufferedReader(new InputStreamReader(resource.getFirst().getInputStream(), StandardCharsets.UTF_8))) {
            return Pair.of(reader.lines().collect(Collectors.joining("\n")), resource.getSecond());
        } catch (IOException e) {
            throw new RuntimeException("Failed to load DB schema context", e);
        }
    }

}
