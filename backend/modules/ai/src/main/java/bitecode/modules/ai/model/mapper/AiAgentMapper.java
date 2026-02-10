package bitecode.modules.ai.model.mapper;

import bitecode.modules.ai.model.data.NoAuthAiAgentDetails;
import bitecode.modules.ai.model.entity.AiAgent;
import bitecode.modules.ai.model.entity.AiAgentExemplaryPrompt;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AiAgentMapper {
    @Mapping(target = "exemplaryPrompts", source = "exemplaryPrompts", qualifiedByName = "mapExemplaryPromptToString")
    NoAuthAiAgentDetails toDetails(AiAgent aiAgent);

    @Named("mapExemplaryPromptToString")
    static List<String> mapExemplaryPromptToString(List<AiAgentExemplaryPrompt> exemplaryPrompts) {
        return exemplaryPrompts.stream().map(AiAgentExemplaryPrompt::getPrompt).toList();
    }
}
