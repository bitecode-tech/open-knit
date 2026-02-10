## Payment Module

### What this module is

Payment owns payment records, provider execution/webhooks, subscription plans and subscriptions, and the payment-side orchestration that links to transaction events.

### Domain scope

- Owned capabilities:
    - payment creation/status transitions/history
    - subscription plan management and user subscription lifecycle
    - payment-provider execution (mock/stripe)
    - stripe webhook processing for subscription and invoice events
- Owned entities/value objects:
    - `payment.payment`, `payment.payment_history`
    - `payment.subscription`, `payment.subscription_history`, `payment.subscription_plan`
    - provider-specific `stripe_customer`
- Non-owned areas:
    - identity account auth domain
    - transaction event store and transaction ledger ownership
- Boundary rules:
    - consumes transaction events to enrich/update payment/subscription state
    - emits payment events used by transaction module
    - user identity lookups go via `_common` `UserServiceFacade`

### Core flows

1. Create payment and emit payment-created event
    - Trigger: internal service call `PaymentService.createPayment`.
    - Steps: persist `Payment`, append `PaymentHistory(NEW)`, publish `PaymentCreatedEvent`.
    - Output: persisted payment with audit history row.
    - Failure/edge cases: persistence/serialization errors during history write.
2. Provider payment execution
    - Trigger: `PaymentProvidersExecutor.initPayment` (manual/job-driven).
    - Steps: delegate to provider (`PaymentProvider.executePayment`), translate to `PaymentUpdateData`, apply status update.
    - Output: provider reference + updated payment status.
    - Failure/edge cases: provider exception sets payment to `ERROR`.
3. Payment status update
    - Trigger: provider callback logic or internal update call.
    - Steps: locate payment by UUID or externalId, lock by payment UUID, enforce monotonic status progression, append history, publish `PaymentStatusUpdatedEvent` when changed.
    - Output: updated payment and history.
    - Failure/edge cases: invalid amount for confirmed status, unknown payment, lock/contention handling.
4. Subscription initialization and checkout redirect
    - Trigger: `POST /subscriptions` or `PUT /subscriptions`.
    - Steps: validate open-subscription constraints, resolve plan+user, call provider `initSubscription`, return redirect URL.
    - Output: checkout redirect payload.
    - Failure/edge cases: existing open subscription, missing user/plan, provider failures.
5. Stripe subscription lifecycle sync
    - Trigger: Stripe webhook (`/payments/webhooks/stripe`).
    - Steps: verify signature, process events (`invoice.paid`, `customer.subscription.created|updated|deleted`), create/update subscription state and related payment rows.
    - Output: synchronized local subscription/payment state.
    - Failure/edge cases: signature mismatch, event ordering races, missing metadata.
6. Subscription payment posting after transaction completion
    - Trigger: consumed `TransactionStatusUpdatedEvent`.
    - Steps: when transaction is `COMPLETED`, locate subscription by `debitReferenceId`, append subscription payment history.
    - Output: subscription history enriched by completed transaction.
    - Failure/edge cases: missing subscription for event payload.

### Data ownership

- Schema(s): `payment`.
- Main tables/entities:
    - `payment.payment` (`Payment`)
    - `payment.payment_history` (`PaymentHistory`)
    - `payment.subscription` (`Subscription`)
    - `payment.subscription_plan` (`SubscriptionPlan`)
    - `payment.subscription_history` (`SubscriptionHistory`)
    - `payment.stripe_customer` (`StripeCustomer`)
- Audit/event tables:
    - `payment.payment_history` keeps payment update audit trail.
    - `payment.subscription_history` stores subscription payment entries.

### Public API surface

- Controllers/routes:
    - `AdminPaymentController`: `/admin/payments`
        - `GET /`, `GET /{id}`
    - `SubscriptionController`: `/subscriptions`
        - `GET /`, `POST /`, `PUT /`, `DELETE /{subscriptionId}`
    - `AdminSubscriptionController`: `/admin/subscriptions`
        - `GET /`, `POST /`
        - `GET /plans`, `POST /plans`, `PATCH /plans/{planId}`, `GET /plans/active-count`
    - `StripeWebhookHandler`: `/payments/webhooks/stripe`
        - `POST /`
- Consumed events/commands:
    - `TransactionCreatedEvent` (`NewTransactionCreatedEventHandler`)
    - `TransactionStatusUpdatedEvent` (`TransactionModuleEventHandler`)
- Emitted events/commands:
    - `PaymentCreatedEvent` (via mapper from `PaymentService`)
    - `PaymentStatusUpdatedEvent` (on status transitions)
- Exposed facades/interfaces:
    - none directly exported to other modules; integration is event-driven.

### Integrations and dependencies

- Internal module dependencies:
    - `_common` payment/transaction shared enums+events, lock/cache utilities, user facade.
- External integrations:
    - Stripe SDK for checkout/subscription/webhook workflow.
    - Optional mock payment provider for local/test flows.
- Communication style (event-driven or direct facade):
    - event-driven with transaction module.
    - direct facade to identity module via `_common` `UserServiceFacade`.

### Class and Type Catalog

#### config

- `PaymentFlywayMigrationConfig`: registers payment Flyway migration module.
- `PaymentDemoInsertsConfig`: demo inserts runner for payment seed SQL.
- `PaymentProperties`: typed root config for payment app settings.
- `PaymentAppProperties`: nested payment provider config.

#### controller

- `AdminPaymentController`: admin payment listing/details endpoints.
- `SubscriptionController`: user subscription lifecycle endpoints.
- `AdminSubscriptionController`: admin subscription and plan management endpoints.
- `StripeWebhookHandler`: webhook endpoint and event dispatch for Stripe events.

#### service

- `PaymentService`: payment lifecycle orchestration, history persistence, event emission.
- `SubscriptionService`: subscription plan/user subscription logic and provider orchestration.
- `PaymentProvidersExecutor`: executes pending payments through selected providers.

#### handler

- `NewTransactionCreatedEventHandler`: links created transaction UUID back to payment.
- `TransactionModuleEventHandler`: reacts to transaction status completion for subscription history updates.

#### repository

- `PaymentRepository`: payment entity repository and fetch/update helpers.
- `PaymentHistoryRepository`: payment history persistence.
- `SubscriptionRepository`: subscription querying and state updates.
- `SubscriptionPlanRepository`: subscription plan repository.
- `SubscriptionHistoryRepository`: subscription history persistence.
- `StripeCustomerRepository`: Stripe customer mapping repository.

#### provider

- `PaymentProvider`: payment execution abstraction.
- `SubscriptionProvider`: subscription provider abstraction.
- `PaymentProvidersExecutor`: provider selection/dispatch orchestrator.
- `MockPaymentProvider`: local/mock payment provider implementation.
- `StripePaymentProvider`: Stripe provider implementation for payments+subscriptions.
- `StripeWebhookHandler`: webhook processor for Stripe events.
- `StripeProperties`: Stripe property holder.
- `StripeMetadataField`: constants for Stripe metadata keys.

#### model/entity

- `Payment`: core payment aggregate.
- `PaymentHistory`: JSON update log per payment event.
- `Subscription`: user subscription aggregate.
- `SubscriptionPlan`: plan definition and provider params.
- `SubscriptionHistory`: payment entries attached to a subscription.
- `StripeCustomer`: local mapping between user and Stripe customer id.

#### model/data|request|response|enum|projection

- `CreateNewPaymentData`: input model for creating a payment.
- `PaymentUpdateData`: payment status update payload.
- `ExecutePaymentData`: provider execution result.
- `SubscriptionUpdateData`: subscription-linked payment update payload.
- `StripeParams`: provider params attached to subscription plans.
- `PaymentDetails`: payment response projection.
- `PaymentHistoryDetails`: payment history response projection.
- `SetUpSubscriptionRequest`: request to initialize subscription checkout.
- `SetUpSubscriptionResponse`: subscription setup response with redirect URL.
- `NewSubscriptionRequest`: create subscription request payload.
- `EditSubscriptionRequest`: subscription update request payload.
- `NewSubscriptionPlanRequest`: create plan request payload.
- `EditSubscriptionPlanRequest`: update plan request payload.
- `NewPendingSubscriptionForUserRequest`: admin create-pending-subscription request.
- `SubscriptionPlanDetails`: plan response projection.
- `UpdateSubscriptionPlanData`: internal plan update model.
- `InitSubscriptionResult`: provider init result (redirect URL, etc.).
- `SubscriptionResponse`: response model for subscription projection.
- `SubscriptionPaymentEvent`: subscription payment domain event model.
- `PlanSubscriptionsCount`: projection for active counts by plan.
- `PaymentUpdateType`: enum (`NEW`, `UPDATE`) for payment history type.
- `SubscriptionStatus`: enum for subscription lifecycle states.
- `CustomerPair`: Stripe API customer + local entity pair.

#### model/mapper

- `PaymentMapper`: entity-to-payment details and event mapping.
- `PaymentHistoryMapper`: payment history mapping.
- `SubscriptionMapper`: subscription entity mapping.
- `SubscriptionPlanMapper`: plan entity mapping.

### Configuration

- `bitecode.app.payment.provider.stripe.*`: Stripe API key/signature secret/success path.
- `bitecode.app.frontend-url`: redirect target base URL for checkout.
- `DEMO_INSERTS_ENABLED=true|false`: enables payment demo inserts.
- Stripe-specific runtime metadata keys are managed by `StripeMetadataField`.

### Testing notes

- Main test classes:
    - `bitecode/modules/payment/PaymentIntegrationTest.java`
    - `bitecode/modules/payment/PaymentTest.java`
    - `bitecode/modules/payment/SubscriptionTest.java`
    - `bitecode/modules/payment/provider/StripeProviderTest.java`
- Must-cover scenarios:
    - payment creation + history logging + emitted payment events
    - status transition rules and lock-protected updates
    - subscription init/cancel and open-subscription constraints
    - stripe webhook signature validation and event mapping
    - transaction-event handlers updating payment/subscription relations
- Special setup:
    - integration tests rely on shared test infra from `_common` and provider stubs/mocks where appropriate.

### Change log expectations

- Update this file whenever flows/domain/API/integrations/boundaries/classes materially change.
- Treat this update as required for module development.
