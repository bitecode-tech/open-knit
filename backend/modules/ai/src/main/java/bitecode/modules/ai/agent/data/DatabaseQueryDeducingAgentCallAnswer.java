package bitecode.modules.ai.agent.data;

public record DatabaseQueryDeducingAgentCallAnswer(
        String query,
        String error,
        boolean requiresDefiniteAnswer
) {
}
