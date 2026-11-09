package bitecode.modules.demo;

import bitecode.modules.ai.AdminAgentConfigurationController;
import bitecode.modules.ai.AdminAiChatController;
import bitecode.modules.ai.AdminAiServicesProviderConfigurationController;
import bitecode.modules.ai.ChatkitController;
import bitecode.modules.ai.OpenAiAgentController;
import bitecode.modules.ai.UserAiChatController;
import bitecode.modules.auth.auth.AuthController;
import bitecode.modules.auth.auth.admin.AdminAuthController;
import bitecode.modules.auth.user.UserController;
import bitecode.modules.auth.user.admin.AdminUserController;
import bitecode.modules.document.AdminDocumentController;
import bitecode.modules.document.UserDocumentController;
import bitecode.modules.ocr.AdminOcrController;
import bitecode.modules.ocr.AdminOcrProviderConfigController;
import bitecode.modules.ocr.UserOcrController;
import bitecode.modules.payment.payment.AdminPaymentController;
import bitecode.modules.payment.subscription.AdminSubscriptionController;
import bitecode.modules.payment.subscription.SubscriptionController;
import bitecode.modules.payment.payment.provider.stripe.StripeWebhookHandler;
import bitecode.modules.transaction.AdminTransactionController;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.introspect.BeanPropertyDefinition;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.AnnotationTypeFilter;
import org.springframework.core.ResolvableType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.data.web.PagedModel;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.springframework.http.codec.ServerSentEvent;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ControllerJsonNamingContractTest {
    private static final List<Class<?>> CONTROLLERS = List.of(
            AdminAgentConfigurationController.class,
            AdminAiChatController.class,
            AdminAiServicesProviderConfigurationController.class,
            ChatkitController.class,
            OpenAiAgentController.class,
            UserAiChatController.class,
            AdminDocumentController.class,
            UserDocumentController.class,
            AuthController.class,
            AdminAuthController.class,
            UserController.class,
            AdminUserController.class,
            AdminOcrController.class,
            AdminOcrProviderConfigController.class,
            UserOcrController.class,
            AdminPaymentController.class,
            AdminSubscriptionController.class,
            SubscriptionController.class,
            AdminTransactionController.class
    );

    private final ObjectMapper objectMapper = new ObjectMapper()
            .setPropertyNamingStrategy(PropertyNamingStrategies.LOWER_CAMEL_CASE);

    @Test
    void controllerInventoryIncludesEveryRestControllerInFeatureModules() {
        var scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new AnnotationTypeFilter(RestController.class));
        var modulePackages = Set.of(
                "bitecode.modules.ai",
                "bitecode.modules.document",
                "bitecode.modules.auth",
                "bitecode.modules.ocr",
                "bitecode.modules.payment",
                "bitecode.modules.transaction"
        );
        var discoveredControllers = modulePackages.stream()
                .flatMap(packageName -> scanner.findCandidateComponents(packageName).stream())
                .map(beanDefinition -> beanDefinition.getBeanClassName())
                .collect(java.util.stream.Collectors.toSet());
        assertTrue(discoveredControllers.remove(StripeWebhookHandler.class.getName()),
                "Stripe webhook controller must remain explicitly classified as an external provider boundary");
        var inventoriedControllers = CONTROLLERS.stream()
                .map(Class::getName)
                .collect(java.util.stream.Collectors.toSet());

        assertEquals(discoveredControllers, inventoriedControllers,
                "Update the camelCase JSON naming guard when adding or removing a module controller");
    }

    @Test
    void allControllerJsonDtoPropertiesUseCamelCase() {
        var inspectedEndpoints = 0;
        var inspectedDtoTypes = 0;

        for (Class<?> controller : CONTROLLERS) {
            for (Method method : controller.getDeclaredMethods()) {
                if (!isRequestHandler(method)) {
                    continue;
                }

                inspectedEndpoints++;
                var endpoint = controller.getSimpleName() + "." + method.getName();
                for (var parameter : method.getParameters()) {
                    assertTransportParameterName(parameter.getAnnotation(RequestParam.class) == null
                                    ? null : firstNonEmpty(parameter.getAnnotation(RequestParam.class).name(), parameter.getAnnotation(RequestParam.class).value(), parameter.getName()),
                            endpoint);
                    assertTransportParameterName(parameter.getAnnotation(PathVariable.class) == null
                                    ? null : firstNonEmpty(parameter.getAnnotation(PathVariable.class).name(), parameter.getAnnotation(PathVariable.class).value(), parameter.getName()),
                            endpoint);
                    assertTransportParameterName(parameter.getAnnotation(RequestHeader.class) == null
                                    ? null : firstNonEmpty(parameter.getAnnotation(RequestHeader.class).name(), parameter.getAnnotation(RequestHeader.class).value(), parameter.getName()),
                            endpoint);
                    assertTransportParameterName(parameter.getAnnotation(CookieValue.class) == null
                                    ? null : firstNonEmpty(parameter.getAnnotation(CookieValue.class).name(), parameter.getAnnotation(CookieValue.class).value(), parameter.getName()),
                            endpoint);
                    if (parameter.isAnnotationPresent(RequestBody.class) || parameter.isAnnotationPresent(RequestPart.class)
                            || parameter.isAnnotationPresent(ModelAttribute.class)) {
                        var requestPart = parameter.getAnnotation(RequestPart.class);
                        if (requestPart != null) {
                            assertTransportParameterName(firstNonEmpty(requestPart.name(), requestPart.value(), parameter.getName()), endpoint);
                        }
                        inspectedDtoTypes += assertCamelCaseProperties(parameter.getParameterizedType(), endpoint, new java.util.HashSet<>());
                    }
                }
                inspectedDtoTypes += assertCamelCaseProperties(method.getGenericReturnType(), endpoint, new java.util.HashSet<>());
            }
        }

        assertTrue(inspectedEndpoints > 0, "Expected controller endpoints to be inspected");
        assertTrue(inspectedDtoTypes > 0, "Expected request or response DTO types to be inspected");
    }

    private boolean isRequestHandler(Method method) {
        return AnnotatedElementUtils.hasAnnotation(method, RequestMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, GetMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, PostMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, PutMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, PatchMapping.class)
                || AnnotatedElementUtils.hasAnnotation(method, DeleteMapping.class);
    }

    private String firstNonEmpty(String first, String second, String fallback) {
        if (!first.isEmpty()) {
            return first;
        }
        return second.isEmpty() ? fallback : second;
    }

    private void assertTransportParameterName(String name, String endpoint) {
        if (name != null) {
            assertTrue(name.matches("[a-z][A-Za-z0-9]*"),
                    () -> endpoint + " exposes non-camelCase HTTP parameter " + name);
        }
    }

    private int assertCamelCaseProperties(Type type, String endpoint, Set<Class<?>> inspectedTypes) {
        var mapType = ResolvableType.forType(type);
        while (mapType.hasGenerics() && mapType.resolve() != null && isHttpWrapper(mapType.resolve())) {
            mapType = mapType.getGeneric(0);
        }
        var rawType = mapType.resolve();
        if (rawType != null && Map.class.isAssignableFrom(rawType)) {
            var isReviewedAiDataset = endpoint.endsWith(".dataset")
                    && (endpoint.startsWith("UserAiChatController.")
                    || endpoint.startsWith("AdminAiChatController.")
                    || endpoint.startsWith("OpenAiAgentController."));
            assertTrue(isReviewedAiDataset,
                    () -> endpoint + " exposes an unreviewed map-shaped JSON contract");
            return 0;
        }
        var javaType = resolveDtoType(type);
        if (javaType == null || !inspectedTypes.add(javaType.getRawClass())) {
            return 0;
        }

        var properties = objectMapper.getSerializationConfig().introspect(javaType).findProperties();
        for (BeanPropertyDefinition property : properties) {
            var jsonName = property.getName();
            assertFalse(jsonName.contains("_"),
                    () -> endpoint + " exposes " + property.getInternalName() + " as " + jsonName);
            assertTrue(jsonName.matches("[a-z][A-Za-z0-9]*"),
                    () -> endpoint + " exposes non-camelCase JSON property " + jsonName);
        }

        var nestedTypeCount = 0;
        for (BeanPropertyDefinition property : properties) {
            var propertyType = property.getPrimaryType();
            if (propertyType != null) {
                nestedTypeCount += assertCamelCaseProperties(propertyType, endpoint + "." + property.getName(), inspectedTypes);
            }
        }
        return 1 + nestedTypeCount;
    }

    private JavaType resolveDtoType(Type type) {
        var resolvedType = ResolvableType.forType(type);
        while (resolvedType.hasGenerics()) {
            var rawClass = resolvedType.resolve();
            if (rawClass == null || !isHttpWrapper(rawClass)) {
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

    private boolean isHttpWrapper(Class<?> type) {
        return ResponseEntity.class.isAssignableFrom(type)
                || PagedModel.class.isAssignableFrom(type)
                || Mono.class.isAssignableFrom(type)
                || Flux.class.isAssignableFrom(type)
                || ServerSentEvent.class.isAssignableFrom(type)
                || Collection.class.isAssignableFrom(type);
    }
}
