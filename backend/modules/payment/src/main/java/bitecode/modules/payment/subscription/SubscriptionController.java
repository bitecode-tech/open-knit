package bitecode.modules.payment.subscription;

import bitecode.modules._common.model.annotation.AdminOrUserAccess;
import bitecode.modules._common.util.AuthUtils;
import bitecode.modules.payment.payment.model.request.SetUpSubscriptionRequest;
import bitecode.modules.payment.payment.model.response.SetUpSubscriptionResponse;
import bitecode.modules.payment.subscription.model.entity.Subscription;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@AdminOrUserAccess
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    @GetMapping
    public List<Subscription> getSubscriptions(@RequestParam(defaultValue = "true") Boolean active) {
        return subscriptionService.findAllByUserIdInAndActive(List.of(AuthUtils.getUserId()), active);
    }

    @PostMapping
    public SetUpSubscriptionResponse initSubscription(@Valid @RequestBody SetUpSubscriptionRequest request) {
        var result = subscriptionService.initAssignedSubscription(request.subscriptionPlanId(), AuthUtils.getUserId());
        if (result.redirectUrl() == null) {
            throw new RuntimeException("Not implemented");
        }
        return SetUpSubscriptionResponse.builder().redirectUrl(result.redirectUrl()).build();
    }

    @PutMapping
    public SetUpSubscriptionResponse createAndInitSubscription(@Valid @RequestBody SetUpSubscriptionRequest request) {
        var result = subscriptionService.createAndInitSubscription(request.subscriptionPlanId(), AuthUtils.getUserId());
        if (result.redirectUrl() == null) {
            throw new RuntimeException("Not implemented");
        }
        return SetUpSubscriptionResponse.builder().redirectUrl(result.redirectUrl()).build();
    }

    @DeleteMapping("/{subscriptionId}")
    public void cancelSubscription(@PathVariable UUID subscriptionId) {
        subscriptionService.cancelSubscription(subscriptionId);
    }
}
