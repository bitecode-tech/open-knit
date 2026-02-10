package bitecode.modules._common.eventsourcing.converter;

import bitecode.modules._common.eventsourcing.model.Command;
import bitecode.modules._common.model.converter.GenericObjectConverter;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class CommandConverter implements AttributeConverter<Command, String> {

    private final GenericObjectConverter<Command> genericObjectConverter = new GenericObjectConverter<>(Command.class);

    @Override
    public String convertToDatabaseColumn(Command attribute) {
        return genericObjectConverter.convertToDatabaseColumn(attribute);
    }

    @Override
    public Command convertToEntityAttribute(String dbData) {
        return genericObjectConverter.convertToEntityAttribute(dbData);
    }
}