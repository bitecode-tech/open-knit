package bitecode.modules.payment;

import bitecode.modules.payment.payment.AdminPaymentController;
import bitecode.modules.payment.subscription.AdminSubscriptionController;
import bitecode.modules.payment.subscription.SubscriptionController;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.introspect.BeanPropertyDefinition;
import org.junit.jupiter.api.Test;
import org.springframework.core.ResolvableType;
import org.springframework.data.web.PagedModel;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ModuleJsonNamingContractTest {
    private static final List<Class<?>> CONTROLLERS = List.of(
            AdminPaymentController.class,
            AdminSubscriptionController.class,
            SubscriptionController.class
    );
    private final ObjectMapper objectMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE);

    @Test
    void controllerJsonContractsUseCamelCase() {
        var inspectedEndpoints = 0;
        var inspectedTypes = 0;
        for (Class<?> controller : CONTROLLERS) {
            for (Method method : controller.getDeclaredMethods()) {
                if (!isRequestHandler(method)) {
                    continue;
                }
                inspectedEndpoints++;
                var endpoint = controller.getSimpleName() + "." + method.getName();
                for (var parameter : method.getParameters()) {
                    if (parameter.isAnnotationPresent(RequestBody.class) || parameter.isAnnotationPresent(RequestPart.class)
                            || parameter.isAnnotationPresent(ModelAttribute.class)) {
                        inspectedTypes += assertCamelCase(parameter.getParameterizedType(), endpoint, new HashSet<>());
                    }
                }
                inspectedTypes += assertCamelCase(method.getGenericReturnType(), endpoint, new HashSet<>());
            }
        }
        assertTrue(inspectedEndpoints > 0, "Expected payment controller endpoints to be inspected");
        assertTrue(inspectedTypes > 0, "Expected payment JSON DTOs to be inspected");
    }

    private boolean isRequestHandler(Method method) {
        return method.isAnnotationPresent(RequestMapping.class) || method.isAnnotationPresent(GetMapping.class)
                || method.isAnnotationPresent(PostMapping.class) || method.isAnnotationPresent(PutMapping.class)
                || method.isAnnotationPresent(PatchMapping.class) || method.isAnnotationPresent(DeleteMapping.class);
    }

    private int assertCamelCase(Type type, String endpoint, Set<Class<?>> inspectedTypes) {
        var javaType = resolveDtoType(type);
        if (javaType == null || !inspectedTypes.add(javaType.getRawClass())) {
            return 0;
        }
        var properties = objectMapper.getSerializationConfig().introspect(javaType).findProperties();
        for (BeanPropertyDefinition property : properties) {
            var jsonName = property.getName();
            assertFalse(jsonName.contains("_"), () -> endpoint + " exposes snake_case property " + jsonName);
            assertTrue(jsonName.matches("[a-z][A-Za-z0-9]*"), () -> endpoint + " exposes non-camelCase property " + jsonName);
        }
        var nestedCount = 0;
        for (BeanPropertyDefinition property : properties) {
            if (property.getPrimaryType() != null) {
                nestedCount += assertCamelCase(property.getPrimaryType(), endpoint + "." + property.getName(), inspectedTypes);
            }
        }
        return 1 + nestedCount;
    }

    private JavaType resolveDtoType(Type type) {
        var resolvedType = ResolvableType.forType(type);
        while (resolvedType.hasGenerics()) {
            var rawClass = resolvedType.resolve();
            if (rawClass == null || !isContainer(rawClass)) {
                break;
            }
            resolvedType = resolvedType.getGeneric(0);
        }
        var rawClass = resolvedType.resolve();
        if (rawClass == null || rawClass.isPrimitive() || rawClass.isEnum() || rawClass == String.class
                || Number.class.isAssignableFrom(rawClass) || rawClass == Boolean.class
                || Map.class.isAssignableFrom(rawClass) || rawClass == Object.class) {
            return null;
        }
        return objectMapper.getTypeFactory().constructType(resolvedType.getType());
    }

    private boolean isContainer(Class<?> type) {
        return ResponseEntity.class.isAssignableFrom(type) || PagedModel.class.isAssignableFrom(type)
                || Mono.class.isAssignableFrom(type) || Flux.class.isAssignableFrom(type)
                || ServerSentEvent.class.isAssignableFrom(type) || Collection.class.isAssignableFrom(type);
    }
}
