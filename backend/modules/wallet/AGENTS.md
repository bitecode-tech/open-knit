## Wallet Module

### What this module is

Wallet owns user wallet balances by asset, and uses command+event records to track asset amount changes (create/add/subtract) with before/after amounts.

### Domain scope

- Owned capabilities:
    - create/find wallet per user
    - maintain wallet assets by currency/asset code
    - apply additive/subtractive wallet-asset commands
    - persist wallet-asset event history
- Owned entities/value objects:
    - `wallet.wallet`
    - `wallet.wallet_asset`
    - `wallet.wallet_asset_event`
- Non-owned areas:
    - transaction/payment orchestration and provider lifecycle
    - identity user lifecycle
- Boundary rules:
    - wallet updates are command-driven via `WalletAssetEventHandler`
    - each asset mutation is event-audited in `wallet_asset_event`

### Core flows

1. Ensure wallet and wallet asset existence
    - Trigger: command handling pre-hook for non-create commands.
    - Steps: resolve wallet for user, auto-create wallet asset with zero balance when missing.
    - Output: guaranteed wallet asset target for mutation command.
    - Failure/edge cases: creation failure bubbles as command failure.
2. Add wallet asset amount
    - Trigger: `AddWalletAssetCommand` handled via `WalletAssetEventHandler`.
    - Steps: lock by user+currency, load asset, capture `totalBefore`, increment `totalAmount`, persist event row.
    - Output: increased wallet asset balance with audit trail.
    - Failure/edge cases: missing asset (auto-create in pre-hook), lock conflicts.
3. Subtract wallet asset amount
    - Trigger: `SubtractWalletAssetCommand`.
    - Steps: lock by user+currency, validate funds, capture `totalBefore`, decrement `totalAmount`, persist event row.
    - Output: decreased balance with audit trail.
    - Failure/edge cases: insufficient funds -> `UnappliedCommandException`.
4. Create wallet asset command
    - Trigger: `CreateWalletAssetCommand`.
    - Steps: find/create wallet, create asset row with zero total/hold amount, persist create event row.
    - Output: initialized asset container.
    - Failure/edge cases: duplicate asset scenarios depend on repository constraints/query behavior.

### Data ownership

- Schema(s): `wallet`.
- Main tables/entities:
    - `wallet.wallet` (`Wallet`)
    - `wallet.wallet_asset` (`WalletAsset`)
    - `wallet.wallet_asset_event` (`WalletAssetEvent`)
- Audit/event tables:
    - `wallet.wallet_asset_event` stores command event payload and before/after totals.

### Public API surface

- Controllers/routes:
    - none in current module (wallet is currently internal/event-command driven).
- Consumed events/commands:
    - consumed command types via event-listener entry in `WalletAssetEventHandler`.
- Emitted events/commands:
    - no module events emitted currently.
- Exposed facades/interfaces:
    - none.

### Integrations and dependencies

- Internal module dependencies:
    - `_common` generic command handling, cache/lock utilities, base entity and command/event converters.
- External integrations:
    - none beyond Spring/JPA infrastructure.
- Communication style (event-driven or direct facade):
    - internal event-listener command dispatch in modular-monolith context.

### Class and Type Catalog

#### config

- `WalletFlywayMigrationConfig`: registers wallet schema Flyway migration module.

#### service

- `WalletService`: wallet lookup/creation and balance check helpers.

#### handler

- `WalletAssetEventHandler`: central command orchestrator with locking, pre/post hooks, and event-row persistence.
- `WalletAssetEventHandler.Params`: event parameter keys used across command handling lifecycle.
- `AbstractWalletAssetCommandHandler<C>`: base command handler abstraction for wallet asset commands.
- `CreateWalletAssetCommandHandler`: creates new wallet asset row and initializes event params.
- `AddWalletAssetCommandHandler`: increments asset total amount.
- `SubtractWalletAssetCommandHandler`: decrements asset total amount with insufficient-funds guard.

#### repository

- `WalletRepository`: wallet persistence and userId lookups (with optional assets fetch).
- `WalletAssetRepository`: wallet-asset lookup by userId+asset name.
- `WalletAssetEventRepository`: wallet-asset event repository.

#### model/entity

- `Wallet`: root wallet aggregate for user with `frozen` flag and assets relation.
- `WalletAsset`: user asset balance (`totalAmount`, `holdAmount`).
- `WalletAssetEvent`: audit row for command application and before/after totals.

#### model/command

- `AbstractWalletAssetCommand`: base command payload (`userId`, `amount`, `currency`, `referenceId`).
- `CreateWalletAssetCommand`: command to initialize wallet asset.
- `AddWalletAssetCommand`: command to add amount to wallet asset.
- `SubtractWalletAssetCommand`: command to subtract amount from wallet asset.

#### model/data

- `WalletDetails`: wallet response projection.
- `WalletAssetDetails`: wallet asset response projection.

#### model/mapper

- `WalletMapper`: maps wallet entities to details projections.

### Configuration

- Flyway migration path: `classpath:db/migration/wallet`.

### Testing notes

- Main test classes:
    - `bitecode/modules/wallet/_config/WalletIntegrationTest.java`
    - `bitecode/modules/wallet/WalletEventHandlerTest.java`
- Must-cover scenarios:
    - create/add/subtract command paths
    - insufficient funds handling
    - auto-create asset behavior from pre-handle flow
    - event-row correctness (`totalBefore`, `totalAfter`, event payload)
- Special setup:
    - tests run with shared `_common` integration setup and async event handling support.

### Change log expectations

- Update this file whenever flows/domain/API/integrations/boundaries/classes materially change.
- Treat this update as required for module development.
