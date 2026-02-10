//package bitecode.modules.payment.provider;
//
//import bitecode.modules._common.eventsourcing.model.Event;
//import bitecode.modules.auth.utils.Paths;
//import bitecode.modules.payment.PaymentIntegrationTest;
//import bitecode.modules.payment.payment.PaymentService;
//import bitecode.modules.payment.payment.model.enums.PaymentGateway;
//import bitecode.modules.payment.payment.provider.stripe.model.StripeProperties;
//import bitecode.modules.payment.subscription.SubscriptionService;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.github.dockerjava.zerodep.shaded.org.apache.commons.codec.binary.Hex;
//import com.stripe.net.ApiResource;
//import com.stripe.net.Webhook;
//import io.restassured.http.ContentType;
//import lombok.SneakyThrows;
//import org.junit.jupiter.api.BeforeAll;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.core.io.ClassPathResource;
//import org.springframework.test.context.bean.override.mockito.MockitoBean;
//import org.springframework.util.StreamUtils;
//
//import javax.crypto.Mac;
//import javax.crypto.spec.SecretKeySpec;
//import java.math.BigDecimal;
//import java.nio.charset.StandardCharsets;
//import java.nio.file.Files;
//import java.time.Instant;
//import java.util.UUID;
//
//import static io.restassured.RestAssured.given;
//import static org.hamcrest.Matchers.*;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//public class StripeProviderTest extends PaymentIntegrationTest {
//
//    @MockitoBean
//    private StripeProperties stripeProperties;
//
//    @MockitoBean
//    private PaymentService paymentService;
//
//    @MockitoBean
//    private SubscriptionService subscriptionService;
//
//    @BeforeAll
//    public void setup() {
//        when(stripeProperties.getSignatureSecret()).thenReturn("whsec_test_secret");
//    }
//
//    @Test
//    void shouldHandleInvoicePaidEventAndUpdateSubscription() throws Exception {
//        // given
//        var invoicePaidEvent = loadEvent("invoice.paid.json");
//
//        // when
//
//        // @formatter:off
//        given()
//                .contentType(ContentType.JSON)
//                .header("Stripe-Signature", generateSigHeader(invoicePaidEvent, "whsec_test_secret"))
//                .body(invoicePaidEvent)
//        .when()
//                .post(Paths.Payment.Provider.Stripe.POST.webhook)
//        .then()
//                .statusCode(200);
//        // @formatter:on
//
//        // then
//        verify(subscriptionService, times(1)).newSubscriptionPayment(
//                eq(UUID.fromString("d960b6a7-6719-4d97-94aa-f713c839d841")),
//                eq(new BigDecimal("133.33")),
//                eq("pln"),
//                eq(PaymentGateway.STRIPE),
//                eq("in_1RU7Sz4RffDXhxvPolHNeLgw")
//        );
//    }
//
//    @SneakyThrows
//    protected static String loadEvent(String name) {
//        var resource = new ClassPathResource("modules/payment/stripe/webhooks/" + name);
//        try (var inputStream = resource.getInputStream()) {
//            return StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);
//        }
//    }
//
//    public static String generateSigHeader(String payload, String secret) throws Exception {
//        long timestamp = Instant.now().getEpochSecond();
//        String signedPayload = timestamp + "." + payload;
//
//        Mac hasher = Mac.getInstance("HmacSHA256");
//        hasher.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
//        byte[] hash = hasher.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8));
//        String signature = Hex.encodeHexString(hash);
//
//        return "t=" + timestamp + ",v1=" + signature;
//    }
//}
