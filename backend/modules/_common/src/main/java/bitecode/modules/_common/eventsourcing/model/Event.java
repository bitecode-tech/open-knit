package bitecode.modules._common.eventsourcing.model;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.CLASS,
        property = "@class"
)
// Big simplification of CQRS, we remove layer of Command -> Event since we do not use aggregate/hydration etc.
// We persist command only to audit what have happened
public interface Event {
}
