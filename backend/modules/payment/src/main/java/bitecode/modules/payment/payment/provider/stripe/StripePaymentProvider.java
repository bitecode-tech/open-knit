package bitecode.modules.payment.payment.provider.stripe;

import bitecode.modules._common.service.cache.CacheService;
import bitecode.modules._common.service.locking.InMemoryLock;
import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules.payment.payment.model.ExecutePaymentData;
import bitecode.modules.payment.payment.model.data.StripeParams;
import bitecode.modules.payment.payment.provider.PaymentProvider;
import bitecode.modules.payment.payment.provider.stripe.model.CustomerPair;
import bitecode.modules.payment.payment.provider.stripe.model.StripeCustomer;
import bitecode.modules.payment.payment.provider.stripe.model.StripeProperties;
import bitecode.modules.payment.subscription.model.data.UpdateSubscriptionPlanData;
import bitecode.modules.payment.subscription.model.entity.SubscriptionPlan;
import bitecode.modules.payment.subscription.model.enums.SubscriptionStatus;
import bitecode.modules.payment.subscription.model.provider.InitSubscriptionResult;
import bitecode.modules.payment.subscription.model.provider.SubscriptionProvider;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Price;
import com.stripe.model.Product;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.PriceCreateParams;
import com.stripe.param.ProductCreateParams;
import com.stripe.param.SubscriptionUpdateParams;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentProvider implements PaymentProvider, SubscriptionProvider {
    @Value("${bitecode.app.frontend-url:http://localhost:3000}")
    private String frontendUrl;
    private final StripeProperties properties;
    private final StripeCustomerRepository stripeCustomerRepository;
    private final PlatformTransactionManager transactionManager;
    private InMemoryLock inMemoryLock;

    @PostConstruct
    public void init() {
        Stripe.apiKey = properties.getApiKey();
        // TODO set FIXED api version in stripe web app
        Stripe.setAppInfo("Bitecode", "1.0.0");
        log.info("Using Stripe Java SDK version: {}", com.stripe.Stripe.class.getPackage().getImplementationVersion());

    }

    @Override
    public ExecutePaymentData executePayment(UUID paymentId, BigDecimal amount, String currency) {
        if (amount.compareTo(BigDecimal.ONE) < 0) {
            throw new HttpClientErrorException(HttpStatus.BAD_REQUEST, "Stripe min. debit = 1.00");
        }
        var params = SessionCreateParams.builder()
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
//                                .setPrice(properties.getProductId()) //dynamic price can be set by setPriceData
//                                .addTaxRate(properties.getTaxI())
                                .setQuantity(amount.multiply(BigDecimal.valueOf(100)).longValue())
                                .build()
                )
                .setTaxIdCollection(SessionCreateParams.TaxIdCollection.builder().setEnabled(true).build())
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + properties.getPaymentSuccessUrlPath())
                .setCancelUrl(frontendUrl + properties.getPaymentSuccessUrlPath())
                .build();
        try {
            var session = Session.create(params);
            return new ExecutePaymentData(PaymentStatus.PENDING, session.getId(), PaymentGateway.PAYNOW, session.getUrl());
        } catch (StripeException e) {
            log.error("stripe session create err", e);
            throw new RuntimeException("Stripe init payment error", e);
        }
    }

    @Override
    public InitSubscriptionResult initSubscription(SubscriptionPlan subscriptionPlan, UserDetails userDetails) {
        var stripeParams = subscriptionPlan.getParams();
        if (stripeParams == null) {
            stripeParams = createNewStripeSubscriptionPlanWithStripePriceAttached(subscriptionPlan);
            subscriptionPlan.setParams(stripeParams);
        }

        var metadata = Map.of(
                "userId", userDetails.uuid().toString(),
                "subscriptionPlanId", subscriptionPlan.getUuid().toString()
        );

        var params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                .setSuccessUrl(frontendUrl + properties.getPaymentSuccessUrlPath())
                .setCancelUrl(frontendUrl + properties.getPaymentSuccessUrlPath())
                .setCustomer(findOrCreateCustomer(userDetails).customer().getId())
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPrice(stripeParams.getPriceId())
                                .setQuantity(1L)
                                .build()
                )
                .setSubscriptionData(
                        SessionCreateParams.SubscriptionData.builder()
                                .putAllMetadata(metadata)
                                .build()
                )
                .putAllMetadata(metadata)
                .build();

        try {
            var session = Session.create(params);
            return InitSubscriptionResult.builder().redirectUrl(session.getUrl()).build();
        } catch (StripeException e) {
            log.error("Failed to create session checkout link", e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public SubscriptionStatus cancelSubscription(String externalId) {
        try {
            com.stripe.model.Subscription.retrieve(externalId).cancel();
            return SubscriptionStatus.CANCELLING;
        } catch (StripeException e) {
            log.error("Subscription cancel failed", e);
            throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void createSubscriptionPlan(SubscriptionPlan subscriptionPlan) {
        var stripeParams = createNewStripeSubscriptionPlanWithStripePriceAttached(subscriptionPlan);
        subscriptionPlan.setParams(stripeParams);
    }

    @Override
    // TODO rewrite for production code
    public void updateSubscriptionPlan(SubscriptionPlan subscriptionPlan, UpdateSubscriptionPlanData updateData) {
        if (updateData.newPrice() != null) {
            inMemoryLock.tryLockWrap(subscriptionPlan.getUuid().toString(), () -> {
                try {
                    subscriptionPlan.setPrice(updateData.newPrice());
                    var newStripePrice = createStripePrice(subscriptionPlan, subscriptionPlan.getParams().getProductId());
                    subscriptionPlan.getParams().setPriceId(newStripePrice.getId());
                    //TODO lock price for update time
                    for (var subscription : subscriptionPlan.getSubscriptions()) {
                        var stripeSubscription = com.stripe.model.Subscription.retrieve(subscription.getExternalId());
                        var subscriptionItemId = stripeSubscription.getItems().getData().getFirst().getId();
                        var params = SubscriptionUpdateParams.builder()
                                .addItem(
                                        SubscriptionUpdateParams.Item.builder()
                                                .setId(subscriptionItemId)
                                                .setPrice(subscriptionPlan.getParams().getPriceId())
                                                .build()
                                )
                                .build();
                        stripeSubscription.update(params);
                    }
                } catch (StripeException e) {
                    log.error("Subscription plan update failed", e);
                    throw new RuntimeException(e);
                }
            });
        }

    }

    private StripeParams createNewStripeSubscriptionPlanWithStripePriceAttached(SubscriptionPlan subscriptionPlan) {
        var isLocked = inMemoryLock.tryLock(subscriptionPlan.getUuid().toString());
        try {
            var txnTemplate = new TransactionTemplate(transactionManager);
            txnTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

            var productParams = ProductCreateParams.builder()
                    .setName(subscriptionPlan.getName())
                    .build();
            try {
                var product = Product.create(productParams);
                var price = createStripePrice(subscriptionPlan, product.getId());
                return StripeParams.builder()
                        .priceId(price.getId())
                        .productId(product.getId())
                        .build();
            } catch (StripeException e) {
                log.error("Failed to create plan with pricing payment link", e);
                throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        } finally {
            if (isLocked) {
                inMemoryLock.unlock(subscriptionPlan.getUuid().toString());
            }
        }
    }

    private static Price createStripePrice(SubscriptionPlan subscriptionPlan, String productId) throws StripeException {
        var priceParams = PriceCreateParams.builder()
                .setCurrency(subscriptionPlan.getCurrency())
                .setUnitAmount(subscriptionPlan.getPrice().movePointRight(2).longValueExact())
                .setRecurring(
                        PriceCreateParams.Recurring.builder()
                                .setIntervalCount(subscriptionPlan.getPaymentFrequency())
                                .setInterval(intervalOf(subscriptionPlan.getPaymentFrequencyType()))
                                .build()
                )
                .setProduct(productId)
                .build();
        return Price.create(priceParams);
    }

    private Optional<CustomerPair> findCustomer(UUID userId) {
        return stripeCustomerRepository.findByUserId(userId)
                .map(customerEntity -> {
                    try {
                        return new CustomerPair(Customer.retrieve(customerEntity.getStripeCustomerId()), customerEntity);
                    } catch (StripeException e) {
                        log.error("Could not find customer, entity=%s".formatted(customerEntity), e);
                        throw new RuntimeException("Could not find customer, entity=%s".formatted(customerEntity), e);
                    }
                });
    }

    private CustomerPair findOrCreateCustomer(UserDetails userDetails) {
        var userId = userDetails.uuid();
        var userData = userDetails.userData();
        var fullName = Stream.of(userData.name(), userData.surname())
                .filter(Objects::nonNull)
                .collect(Collectors.joining(" "));

        return findCustomer(userId).orElseGet(() -> {
            var params = CustomerCreateParams.builder()
                    .setEmail(userDetails.email())
                    .setName(fullName)
                    .putMetadata("userId", userId.toString())
                    .build();
            try {
                var customer = Customer.create(params);
                var customerEntity = StripeCustomer.builder()
                        .userId(userId)
                        .stripeCustomerId(customer.getId())
                        .build();
                return new CustomerPair(customer, stripeCustomerRepository.save(customerEntity));
            } catch (StripeException e) {
                log.error("Could not create customer, params=%s".formatted(params), e);
                throw new RuntimeException("Could not create customer, params=%s".formatted(params), e);
            }
        });
    }

    private static PriceCreateParams.Recurring.Interval intervalOf(ChronoUnit chronoUnit) {
        return switch (chronoUnit) {
            case DAYS -> PriceCreateParams.Recurring.Interval.DAY;
            case WEEKS -> PriceCreateParams.Recurring.Interval.WEEK;
            case MONTHS -> PriceCreateParams.Recurring.Interval.MONTH;
            case YEARS -> PriceCreateParams.Recurring.Interval.YEAR;
            default -> throw new HttpClientErrorException(HttpStatus.INTERNAL_SERVER_ERROR, "Unsupported interval unit");
        };
    }

    @Override
    public PaymentGateway paymentGateway() {
        return PaymentGateway.STRIPE;
    }

    @Autowired
    public void setInMemoryLock(CacheService cacheService) {
        this.inMemoryLock = new InMemoryLock(cacheService, "STRIPE");
    }
}
