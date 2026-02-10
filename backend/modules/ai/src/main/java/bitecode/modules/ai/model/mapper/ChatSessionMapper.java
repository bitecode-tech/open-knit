package bitecode.modules.ai.model.mapper;

import bitecode.modules.ai.model.data.details.ChatSessionMessageDetails;
import bitecode.modules.ai.model.data.details.ChatSessionWithCountDetails;
import bitecode.modules.ai.model.data.projection.ChatSessionWithUserMessageCount;
import bitecode.modules.ai.model.entity.ChatSessionMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ChatSessionMapper {
    @Mapping(target = "externalSessionId", source = "chatSession.externalSessionId")
    @Mapping(target = "messagesCount", source = "userMessageCount")
    @Mapping(target = "id", source = "chatSession.id")
    ChatSessionWithCountDetails toDetails(ChatSessionWithUserMessageCount session);

    ChatSessionMessageDetails toDetails(ChatSessionMessage message);
}
