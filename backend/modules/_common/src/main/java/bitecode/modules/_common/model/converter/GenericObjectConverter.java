package bitecode.modules._common.model.converter;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.RequiredArgsConstructor;

import java.io.IOException;

@Converter
@RequiredArgsConstructor
public class GenericObjectConverter<T> implements AttributeConverter<T, String> {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Class<T> tClass;

    public String convertToDatabaseColumn(T attribute) {
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing: " + tClass.getSimpleName(), e);
        }
    }

    public T convertToEntityAttribute(String dbData) {
        try {
            return objectMapper.readValue(dbData, tClass);
        } catch (IOException e) {
            throw new RuntimeException("Error deserializing:" + tClass.getSimpleName(), e);
        }
    }
}