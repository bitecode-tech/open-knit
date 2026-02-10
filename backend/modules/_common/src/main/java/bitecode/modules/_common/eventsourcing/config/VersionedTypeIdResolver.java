package bitecode.modules._common.eventsourcing.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DatabindContext;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.jsontype.impl.TypeIdResolverBase;

import java.io.IOException;

public class VersionedTypeIdResolver extends TypeIdResolverBase {

    @Override
    public String idFromValue(Object value) {
        return idFromValueAndType(value, value.getClass());
    }

    @Override
    public String idFromValueAndType(Object value, Class<?> suggestedType) {
        String className = suggestedType.getName();
        String version = getVersionFromAnnotation(suggestedType);
        return className + "_" + version;
    }

    @Override
    public JavaType typeFromId(DatabindContext context, String id) throws IOException {
        int lastUnderscore = id.lastIndexOf('_');
        if (lastUnderscore == -1) {
            throw new IOException("Invalid id format: " + id);
        }
        String className = id.substring(0, lastUnderscore);
        try {
            Class<?> clazz = Class.forName(className);
            return context.constructType(clazz);
        } catch (ClassNotFoundException e) {
            throw new IOException("Class not found: " + className, e);
        }
    }

    @Override
    public JsonTypeInfo.Id getMechanism() {
        return JsonTypeInfo.Id.CUSTOM;
    }

    private String getVersionFromAnnotation(Class<?> clazz) {
        EventVersion annotation = clazz.getAnnotation(EventVersion.class);
        if (annotation != null) {
            return annotation.value();
        } else {
            throw new RuntimeException("Specify event version");
        }
    }
}

