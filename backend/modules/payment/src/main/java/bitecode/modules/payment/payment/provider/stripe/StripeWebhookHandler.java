package bitecode.modules.payment.payment.provider.stripe;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules.payment.payment.PaymentService;
import bitecode.modules.payment.payment.model.data.PaymentUpdateData;
import bitecode.modules.payment.payment.provider.stripe.model.StripeMetadataField;
import bitecode.modules.payment.payment.provider.stripe.model.StripeProperties;
import bitecode.modules.payment.subscription.SubscriptionService;
import bitecode.modules.payment.subscription.model.enums.SubscriptionStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Invoice;
import com.stripe.model.Subscription;
import com.stripe.net.Webhook;
import com.stripe.param.SubscriptionUpdateParams;
import jakarta.annotation.security.PermitAll;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;

@Slf4j
@RestController
@RequestMapping("/payments/webhooks/stripe")
@RequiredArgsConstructor
public class StripeWebhookHandler {
    private final StripeProperties properties;
    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;
    private final SubscriptionService subscriptionService;

    //TODO in order to have ORDERED events, we have to store (db/queue) and order by createdate with delay i.e 3s
    // stripe on event retry does not update event data
    @PermitAll
    @Transactional
    @PostMapping
    public ResponseEntity<Void> paymentUpdate(@RequestBody String body, @RequestHeader HttpHeaders headers) {
        try {
            var sigHeader = headers.getFirst("Stripe-Signature");
            var event = Webhook.constructEvent(body, sigHeader, properties.getSignatureSecret());
            // that works ONLY for card-only payments. If ach, transfer or any alike it is enabled then async payment check has to be implemented
//            if(log.isDebugEnabled()){
//                FileUtils.writeToFileAsJson(Path.of("stripe", event.getType() + ".json"), event.toJson());
//            }
            switch (event.getType()) {
//                case "checkout.session.completed" -> handleCheckoutSessionCompleted(event);
                case "invoice.paid" -> handleInvoicePaid(event);
//                case "invoice.payment_failed" -> handlePaymentFailed(event);
                case "customer.subscription.created" -> handleCustomerSubscriptionCreated(event);
                case "customer.subscription.updated", "customer.subscription.deleted" -> handleCustomerSubscriptionUpdated(event);
                case null -> log.error("unexpected event, no type={}", event);
                default -> {
                }
            }

            return ResponseEntity.ok().build();
        } catch (SignatureVerificationException e) {
            log.error("Stripe signature verification exception body={}", body);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Stripe unexpected exception", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    private void handleCheckoutSessionCompleted(Event event) throws JsonProcessingException {
        // user successfully paid
        var eventData = getDeserializedEventData(event);
        var updateData = PaymentUpdateData.builder()
                .externalId(getEventObjectId(eventData))
                .status(mapEventStatus("complete", PaymentStatus.CONFIRMED).apply(eventData))
                .amount(getAmountSubtotal(eventData))
                .modifiedAt(Instant.ofEpochMilli(event.getCreated()))
                .build();
        paymentService.updatePaymentStatus(updateData);
    }

    public void handleInvoicePaid(Event event) throws StripeException {
        var invoice = (Invoice) event.getDataObjectDeserializer().getObject()
                .orElseThrow(() -> new RuntimeException("Could not deserialize Invoice"));
        var subscriptionDetails = invoice.getParent().getSubscriptionDetails();

        var metadata = subscriptionDetails.getMetadata();
        var subscriptionId = getSubscriptionId(metadata, subscriptionDetails);
        var amount = toBigDecimal(invoice.getSubtotal());

        subscriptionService.newSubscriptionPayment(UUID.fromString(subscriptionId), amount, invoice.getCurrency(), PaymentGateway.STRIPE, invoice.getId());
    }

    public void handleCustomerSubscriptionCreated(Event event) throws StripeException {
        var subscription = (Subscription) event.getDataObjectDeserializer().getObject()
                .orElseThrow(() -> new RuntimeException("Could not deserialize Subscription"));

        var metadata = subscription.getMetadata();
        var userId = UUID.fromString(metadata.get(StripeMetadataField.USER_ID));
        var subscriptionPlanId = UUID.fromString(metadata.get(StripeMetadataField.SUBSCRIPTION_PLAN_ID));

        var nextPaymentDate = getNextPaymentDate(subscription);
        var subscriptionEntity = subscriptionService.createOrUpdateSubscription(userId, subscriptionPlanId, subscription.getId(),
                subscription.getCurrency(), SubscriptionStatus.of(subscription.getStatus()), nextPaymentDate);

        subscription.update(SubscriptionUpdateParams.builder()
                .putMetadata(StripeMetadataField.SUBSCRIPTION_ID, subscriptionEntity.getUuid().toString())
                .build());
    }

    public void handleCustomerSubscriptionUpdated(Event event) {
        log.info(event.toJson());
        var subscription = (Subscription) event.getDataObjectDeserializer().getObject()
                .orElseThrow(() -> new RuntimeException("Could not deserialize subscription"));
        var metadata = subscription.getMetadata();
        var newStatus = SubscriptionStatus.of(subscription.getStatus());
        var subscriptionId = metadata.get(StripeMetadataField.SUBSCRIPTION_ID);
        if (subscriptionId == null) {
            // means that there was subscription.created/updated race
            return;
        }
        var subscriptionUuid = UUID.fromString(subscriptionId);
        subscriptionService.updateSubscriptionStatus(subscriptionUuid, newStatus);
        subscriptionService.updateSubscriptionNextPaymentDate(subscriptionUuid, getNextPaymentDate(subscription));
    }

    private static String getSubscriptionId(Map<String, String> metadata, Invoice.Parent.SubscriptionDetails subscriptionDetails) throws StripeException {
        var subscriptionId = metadata.get((StripeMetadataField.SUBSCRIPTION_ID));
        if (subscriptionId == null) {
            var subscription = Subscription.retrieve(subscriptionDetails.getSubscription());
            subscriptionId = subscription.getMetadata().get(StripeMetadataField.SUBSCRIPTION_ID);
            if (subscriptionId == null) {
                throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Subscription not yet created");
            }
        }
        return subscriptionId;
    }


    private JsonNode getDeserializedEventData(Event event) throws JsonProcessingException {
        try {
            return objectMapper.readValue(event.getDataObjectDeserializer().getRawJson(), JsonNode.class);
        } catch (IOException e) {
            log.error("Stripe deserialize error, possible API <-> Library versions mismatch");
            throw e;
        }
    }

    private static Instant getNextPaymentDate(Subscription subscription) {
        var subscriptionItem = subscription.getItems().getData().getFirst();
        return Instant.ofEpochSecond(subscriptionItem.getCurrentPeriodEnd());
    }

    private Function<JsonNode, PaymentStatus> mapEventStatus(String expected, PaymentStatus mapping) {
        return eventData -> {
            var eventStatusOp = Optional.ofNullable(eventData.get("status")).map(JsonNode::asText);
            if (eventStatusOp.filter(expected::equals).isPresent()) {
                return mapping;
            }
            log.error("Unexpected event status={}, expected={},mapping={},", eventStatusOp.orElse("missing"), expected, mapping);
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST);
        };
    }

    private String getEventObjectId(JsonNode eventData) {
        return eventData.get("id").asText();
    }

    private BigDecimal getAmountSubtotal(JsonNode eventData) {
        var subtotal = BigDecimal.valueOf(eventData.get("amount_subtotal").asLong());
        return subtotal.divide(BigDecimal.valueOf(100L), RoundingMode.UNNECESSARY);
    }

    private static BigDecimal toBigDecimal(Long subtotal) {
        return BigDecimal.valueOf(subtotal).movePointLeft(2);
    }

}
