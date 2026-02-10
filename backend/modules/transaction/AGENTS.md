## Transaction Module

### What this module is

Transaction is the ledger-style module that records payment-related transactions, applies command handlers for state transitions, persists transaction command history, and exposes
admin read APIs.

### Domain scope

- Owned capabilities:
    - create/update transaction rows from payment events
    - persist transaction command history in transaction event table
    - expose admin listing/statistics/detail endpoints
- Owned entities/value objects:
    - `transaction.transaction`
    - `transaction.transaction_event`
    - transaction command records and criteria/detail projections
- Non-owned areas:
    - payment provider execution and subscription plan lifecycle
    - wallet balances
- Boundary rules:
    - consumes payment module events (`PaymentCreatedEvent`, `PaymentStatusUpdatedEvent`)
    - emits transaction module events (`TransactionCreatedEvent`, `TransactionStatusUpdatedEvent`)
    - command handling is centralized through `TransactionCommandHandler`

### Core flows

1. Create transaction from payment-created event
    - Trigger: consumed `PaymentCreatedEvent` without existing `transactionId`.
    - Steps: map to `CreatePaymentTransactionCommand`, route through command handler, persist `Transaction`, persist `TransactionEvent`, emit `TransactionCreatedEvent`.
    - Output: new transaction linked to payment.
    - Failure/edge cases: missing command handler mapping or persistence failures.
2. Update transaction from payment status update
    - Trigger: consumed `PaymentStatusUpdatedEvent`.
    - Steps: map status to command (`ConfirmPaymentTransactionCommand` or `SetPaymentTransactionErrorCommand`), apply handler, store event row, emit status-updated module event.
    - Output: updated transaction status/substatus.
    - Failure/edge cases: unsupported status mapping ignored, unknown transaction id raises unapplied command.
3. Admin transaction retrieval and statistics
    - Trigger: `/admin/transactions` endpoints.
    - Steps: apply criteria filters (status/date), query repository/projection mapping, return page/details/stat counts.
    - Output: pageable transaction detail views and aggregate counters.
    - Failure/edge cases: invalid status query parameter -> bad request.

### Data ownership

- Schema(s): `transaction`.
- Main tables/entities:
    - `transaction.transaction` (`Transaction`)
    - `transaction.transaction_event` (`TransactionEvent`)
- Audit/event tables:
    - `transaction.transaction_event` is the module audit/event table for handled commands.

### Public API surface

- Controllers/routes:
    - `AdminTransactionController`: `/admin/transactions`
        - `GET /`, `GET /statistics`, `GET /{id}`
- Consumed events/commands:
    - `PaymentCreatedEvent`
    - `PaymentStatusUpdatedEvent`
- Emitted events/commands:
    - `TransactionCreatedEvent` (from create handlers)
    - `TransactionStatusUpdatedEvent` (from status update handlers)
- Exposed facades/interfaces:
    - none (integration is event-driven + admin HTTP reads).

### Integrations and dependencies

- Internal module dependencies:
    - `_common` transaction/payment shared enums and event contracts.
    - `_common` generic command-handler infrastructure.
- External integrations:
    - none beyond Spring/JPA infrastructure.
- Communication style (event-driven or direct facade):
    - event-driven with payment module.

### Class and Type Catalog

#### config

- `TransactionFlywayMigrationConfig`: registers Flyway migration module for transaction schema.
- `TransactionDemoInsertsConfig`: demo inserts runner for transaction seed SQL.

#### controller

- `AdminTransactionController`: admin APIs for list/statistics/get-by-uuid transaction views.

#### service

- `TransactionService`: read-oriented transaction service for lists, criteria filtering, stats, and event retrieval.

#### handler

- `PaymentModuleEventsHandler`: consumes payment events and maps them to transaction commands.
- `AbstractTransactionCommandHandler<T>`: base command-handler abstraction for transaction commands.
- `CreateNewTransactionCommandHandler`: handles generic create transaction command.
- `UpdateTransactionStatusCommandHandler`: updates transaction status/substatus by UUID.
- `CreatePaymentTransactionCommandHandler`: creates transaction from payment-created event payload.
- `ConfirmPaymentTransactionCommandHandler`: marks payment transaction as completed/pending flow-specific states.
- `SetPaymentTransactionErrorCommandHandler`: marks transaction as error.

#### repository

- `TransactionRepository`: transaction repository with fetch methods and criteria queries.
- `CustomTransactionRepository`: custom query contract.
- `CustomTransactionRepositoryImpl`: custom query implementation.
- `TransactionEventRepository`: event rows repository by transaction id.
- `TransactionCommandHandler`: central generic command orchestrator for all transaction commands/events.

#### model/entity

- `Transaction`: transaction aggregate with debit/credit fields and optional loaded event list.
- `TransactionEvent`: persisted command payload event row (`eventName`, `eventData`).

#### model/command

- `AbstractTransactionCommand`: marker interface for transaction commands.
- `CreateNewTransactionCommand`: generic create command payload.
- `UpdateTransactionStatusCommand`: generic status update command payload.
- `CreatePaymentTransactionCommand`: payment-origin transaction creation command.
- `ConfirmPaymentTransactionCommand`: payment-confirmation command.
- `SetPaymentTransactionErrorCommand`: payment-error command.

#### model/data

- `TransactionCriteria`: filter criteria for admin list queries.
- `TransactionDetails`: response/details projection.
- `TransactionEventDetails`: transaction event details projection.

#### model/mapper

- `TransactionMapper`: maps entities/commands/events/detail projections.
- `TransactionEventMapper`: maps transaction event rows to details DTOs.

### Configuration

- Flyway migration path: `classpath:db/migration/transaction`.
- `DEMO_INSERTS_ENABLED=true|false`: enables transaction demo inserts.

### Testing notes

- Main test classes:
    - `bitecode/modules/transaction/_config/TransactionIntegrationTest.java`
    - `bitecode/modules/transaction/TransactionCommandHandlerTest.java`
    - `bitecode/modules/transaction/TransactionPaymentTest.java`
- Must-cover scenarios:
    - payment-created/payment-status-updated event mapping to commands
    - command handler persistence into `transaction_event`
    - transaction status/substatus transition correctness
    - admin filtering/statistics endpoint correctness
- Special setup:
    - tests depend on shared `_common` test base with Testcontainers-backed database.

### Change log expectations

- Update this file whenever flows/domain/API/integrations/boundaries/classes materially change.
- Treat this update as required for module development.
