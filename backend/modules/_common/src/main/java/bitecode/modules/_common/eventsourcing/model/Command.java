package bitecode.modules._common.eventsourcing.model;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.CLASS,
        property = "@class"
)
public interface Command {
}
