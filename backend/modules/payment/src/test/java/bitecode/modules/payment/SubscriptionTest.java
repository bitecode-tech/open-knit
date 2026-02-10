package bitecode.modules.payment;

import bitecode.modules._common.shared.identity.user.UserServiceFacade;
import bitecode.modules._common.shared.identity.user.model.data.UserDetails;
import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules.payment.payment.provider.PaymentProvidersExecutor;
import bitecode.modules.payment.payment.provider.stripe.StripePaymentProvider;
import bitecode.modules.payment.subscription.SubscriptionService;
import bitecode.modules.payment.subscription.model.entity.SubscriptionPlan;
import bitecode.modules.payment.subscription.model.provider.InitSubscriptionResult;
import bitecode.modules.payment.subscription.model.request.NewSubscriptionPlanRequest;
import bitecode.modules.payment.subscription.repository.SubscriptionPlanRepository;
import bitecode.modules.payment.subscription.repository.SubscriptionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

public class SubscriptionTest extends PaymentIntegrationTest {

    @Autowired
    ApplicationEventPublisher eventPublisher;

    @MockitoBean
    StripePaymentProvider stripePaymentProvider;

    @MockitoBean
    UserServiceFacade userServiceFacade;

    @Autowired
    SubscriptionService subscriptionService;
    @Autowired
    SubscriptionRepository subscriptionRepository;
    @Autowired
    SubscriptionPlanRepository subscriptionPlanRepository;
    @Autowired
    PaymentProvidersExecutor providersExecutor;

    @BeforeAll
    public void beforeAll(){
        Mockito.when(stripePaymentProvider.paymentGateway()).thenReturn(PaymentGateway.STRIPE);
        subscriptionService.setSubscriptionProviders(List.of(stripePaymentProvider));
    }

    @AfterEach
    public void cleanUp() {
        subscriptionRepository.deleteAll();
        subscriptionPlanRepository.deleteAll();
    }

    @Test
    public void shouldCreateNewSubscriptionPlan() {
        // given
        var req = NewSubscriptionPlanRequest.builder()
                .name("test plan1")
                .price(BigDecimal.valueOf(123.319))
                .paymentFrequency(3L)
                .paymentFrequencyType(ChronoUnit.DAYS)
                .currency("pln")
                .build();

        Mockito.doNothing().when(stripePaymentProvider).createSubscriptionPlan(ArgumentMatchers.any(SubscriptionPlan.class));

        // when
        subscriptionService.createNewSubscriptionPlan(req);

        // then
        var allSubPlans = subscriptionPlanRepository.findAll();
        var subPlan = allSubPlans.getFirst();

        assertThat(allSubPlans.size(), is(1));
        assertThat(subPlan, allOf(
                hasProperty("name", is("test plan1")),
                hasProperty("price", comparesEqualTo(BigDecimal.valueOf(123.32))),
                hasProperty("currency", is("pln")),
                hasProperty("paymentFrequency", is(3L)),
                hasProperty("paymentFrequencyType", is(ChronoUnit.DAYS))
        ));
    }

    @Test
    public void shouldProperlyInitiateSubscription() {
        // given
        var userId = UUID.randomUUID();
        var initSubResult = InitSubscriptionResult.builder().redirectUrl("url").build();
        var subPlan = SubscriptionPlan.builder()
                .price(BigDecimal.valueOf(123.319))
                .name("test plan1")
                .paymentFrequency(2L)
                .currency("pln")
                .paymentFrequencyType(ChronoUnit.DAYS)
                .build();
        subPlan = subscriptionPlanRepository.save(subPlan);

        Mockito.when(userServiceFacade.getUserDetails(ArgumentMatchers.eq(userId)))
                .thenReturn(Optional.of(Mockito.mock(UserDetails.class)));
        Mockito.when(stripePaymentProvider.initSubscription(ArgumentMatchers.eq(subPlan), ArgumentMatchers.any()))
                .thenReturn(initSubResult);

        // when
        var returnedInitSubResult = subscriptionService.initAssignedSubscription(subPlan.getUuid(), userId);

        // then
        assertThat(returnedInitSubResult, equalTo(initSubResult));
    }
}
