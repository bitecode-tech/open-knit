package bitecode.modules.payment.subscription;

import bitecode.modules._common.model.annotation.AdminAccess;
import bitecode.modules.payment.subscription.model.data.SubscriptionPlanDetails;
import bitecode.modules.payment.subscription.model.data.UpdateSubscriptionPlanData;
import bitecode.modules.payment.subscription.model.entity.Subscription;
import bitecode.modules.payment.subscription.model.entity.SubscriptionPlan;
import bitecode.modules.payment.subscription.model.mapper.SubscriptionPlanMapper;
import bitecode.modules.payment.subscription.model.projection.PlanSubscriptionsCount;
import bitecode.modules.payment.subscription.model.request.EditSubscriptionPlanRequest;
import bitecode.modules.payment.subscription.model.request.NewSubscriptionPlanRequest;
import bitecode.modules.payment.subscription.model.request.admin.NewPendingSubscriptionForUserRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PagedModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@AdminAccess
@RequestMapping("/admin/subscriptions")
@RequiredArgsConstructor
public class AdminSubscriptionController {
    private final SubscriptionService subscriptionService;
    private final SubscriptionPlanMapper subscriptionPlanMapper;

    @GetMapping
    public List<Subscription> getSubscriptions(@RequestParam(required = false) List<UUID> userIds,
                                               @RequestParam(defaultValue = "false") Boolean active) {
        if (userIds != null) {
            return subscriptionService.findAllByUserIdInAndActive(userIds, active);
        }
        throw new HttpClientErrorException(HttpStatus.BAD_REQUEST);
    }

    @PostMapping
    public Subscription createPendingSubscriptionForUser(@Valid @RequestBody NewPendingSubscriptionForUserRequest request) {
        return subscriptionService.setUpPendingSubscription(request.subscriptionPlanId(), request.userId());
    }

    @GetMapping("/plans")
    public PagedModel<SubscriptionPlanDetails> getSubscriptionPlans(Pageable pageable) {
        return new PagedModel<>(
                subscriptionService.findAllPlans(pageable)
                        .map(subscriptionPlanMapper::toSubscriptionPlanDetails)
        );
    }

    @PostMapping("/plans")
    public ResponseEntity<SubscriptionPlan> createSubscriptionPlan(@Valid @RequestBody NewSubscriptionPlanRequest request) {
        return ResponseEntity.ok(subscriptionService.createNewSubscriptionPlan(request));
    }

    @PatchMapping("/plans/{planId}")
    public SubscriptionPlan editSubscriptionPlan(@Valid @RequestBody EditSubscriptionPlanRequest request, @PathVariable UUID planId) {
        return subscriptionService.updateSubscriptionPlan(planId, UpdateSubscriptionPlanData.builder()
                .newPrice(request.price())
                .build());
    }

    @GetMapping("/plans/active-count")
    public List<PlanSubscriptionsCount> countActiveSubscriptionsByPlanUuids(@RequestParam List<UUID> subscriptionPlanIds) {
        return subscriptionService.countActiveSubscriptionsByPlanUuids(subscriptionPlanIds);
    }
}
