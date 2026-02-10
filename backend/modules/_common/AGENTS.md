## Common Module (`_common`)

### What this module is

`_common` is the shared foundation module used by all backend modules.  
It does not implement business workflows itself. It provides:

- cross-module contracts (events, enums, DTOs, facades)
- base persistence abstractions and converters
- framework and infrastructure configuration
- shared utility and technical services (cache, email, locking, auth utils)

### Domain scope

This module owns technical/shared domain primitives, not business aggregates.

- **Shared contracts domain:** payment/transaction/identity types used across module boundaries
- **Infrastructure domain:** Flyway orchestration, QueryDSL wiring, async executors, global exception mapping
- **Persistence foundation domain:** base entities, generic JSON converters, command/event converter
- **Cross-cutting services domain:** cache abstraction, in-memory locking, email delivery

### Core flows

No business flows are defined in `_common` and they are intentionally omitted.

### Data ownership

- `_common` does not own a business schema with aggregate roots.
- It provides base entities and optional `_config` helper table creation through demo insert bootstrap (`_config.demo_inserts_log`).

### Class and Type Catalog

Below is a full list of Java types in this module with brief purpose descriptions.

#### Configuration (`config`)

- `CaffeineCacheConfig`: registers Spring `CacheManager` (`CaffeineCacheManager`) bean.
- `FlywayConfig`: custom Flyway migration strategy that runs configured module migrations schema-by-schema and validates each.
- `GlobalExceptionHandlerConfig`: global REST exception mapping for validation, HTTP client errors, upload size errors, and fallback runtime errors.
- `JacksonObjectMapperConfig`: object mapper config holder (currently `@Bean` method commented out).
- `QueryDslConfig`: exposes `JPAQueryFactory` bean.
- `ThreadExecutorsConfig`: enables async support, configures MVC async executor/timeouts, and provides virtual-thread `ExecutorService`.
- `WebConfig`: applies global `"/api"` path prefix to all controllers (`PATH_PREFIX` constant).

#### Module bootstrapping config (`config/_modules`)

- `InitialInsertsConfig`: abstract base for one-time demo SQL execution with `_config.demo_inserts_log` idempotency tracking.
- `CommonDemoInsertsConfig`: `_common` demo insert runner (conditional by `DEMO_INSERTS_ENABLED=true`), executes `demo-inserts/user-email-reference.sql`.

#### Flyway config model (`config/flyway`)

- `FlywayMigrationModule` (`record`): schema/location pair used by `FlywayConfig`.

#### Properties (`config/properties`)

- `AppProperties`: typed holder for `backendUrl` and `frontendUrl`.

#### Event-sourcing helpers (`eventsourcing`)

- `EventVersion` (`@interface`): annotation that marks event version for custom Jackson type id resolution.
- `VersionedTypeIdResolver`: Jackson type id resolver that serializes type id as `<class>_<version>` and resolves class during deserialization.
- `CommandConverter`: JPA converter for `Command` JSON persistence.
- `UnappliedCommandException`: domain-specific runtime exception for unapplied/ignored commands.
- `AbstractCommandHandler<R, C extends Command>`: base command handler contract with optional `toModuleEvent` hook.
- `Command` (`interface`): marker interface for command payload polymorphic JSON serialization.
- `Event` (`interface`): marker interface for event payload polymorphic JSON serialization.
- `GenericCommandHandler<C,T,CHT,EN,RT>`: generic command processing template (pre/post/finally hooks, event publishing, audit event persistence, error handling).

#### Common model primitives (`model`)

- `AdminAccess` (`@interface`): meta-annotation for `@RolesAllowed("ADMIN")`.
- `AdminOrUserAccess` (`@interface`): meta-annotation for `@RolesAllowed({"USER","ADMIN"})`.
- `UserAccess` (`@interface`): meta-annotation for `@RolesAllowed("USER")`.
- `GenericObjectConverter<T>`: generic JPA JSON converter using Jackson for arbitrary type serialization/deserialization.
- `BaseEntity`: mapped superclass with numeric `id`, `createdDate`, `updatedDate`, and id-based equality.
- `UuidBaseEntity`: mapped superclass extending `BaseEntity` with immutable unique UUID field auto-generated in constructor.
- `EnvProfile` (`enum`): environment profile enum (`LOCAL`, `DEV`, `STAGE`, `PROD`) with case-insensitive compare helper and string constants.
- `ModuleEvent` (`interface`): marker interface for Spring application events used across modules.

#### Shared services (`service`)

- `CacheRef<K,V>`: typed cache reference wrapper over `CacheProvider`.
- `CacheService`: service factory for creating named caches with expiration settings.
- `CacheProvider` (`interface`): abstraction for cache backend operations.
- `MemoryCacheProvider`: in-memory Guava cache implementation of `CacheProvider`.
- `EmailService`: sends emails via `JavaMailSender`, with template-based and raw content overloads.
- `InMemoryLock`: lock helper built on cache; provides per-key lock/unlock and wrapped execution with automatic unlock.

#### Shared contracts: identity (`shared/identity`)

- `MfaMethod` (`enum`): MFA mode values (`EMAIL`, `QR_CODE`, `DISABLE`).
- `UserServiceFacade` (`interface`): cross-module user lookup/read facade (`getUserDetails`, user-id pagination).
- `PrincipalDetails` (`interface`): authenticated principal contract extending Spring `UserDetails` with `UUID getUuid()`.
- `UserDataDetails` (`record`): lightweight user profile data (`uuid`, `name`, `surname`).
- `UserDetails` (`record`): shared user identity projection (roles, email confirmation, MFA, metadata, timestamps).

#### Shared contracts: payment (`shared/payment`)

- `PaymentGateway` (`enum`): payment provider/channel (`MOCK`, `WALLET`, `PAYNOW`, `STRIPE`).
- `PaymentStatus` (`enum`): payment lifecycle status with monotonic update-level logic and string-to-enum parser.
- `PaymentType` (`enum`): payment mode (`ONE_TIME`, `RECURRING`).
- `PaymentCreatedEvent` (`record`): module event payload emitted on payment creation.
- `PaymentStatusUpdatedEvent` (`record`): module event payload emitted on payment status transitions.

#### Shared contracts: transaction (`shared/transaction`)

- `TransactionCreditType` (`enum`): transaction credit category (`PRODUCT`, `WALLET`, `PROVIDER_WALLET`).
- `TransactionDebitType` (`enum`): transaction debit source (`CARD`, `BANK_TRANSFER`, `WALLET`, `TO_BE_SET`).
- `TransactionStatus` (`enum`): high-level transaction state (`PENDING`, `COMPLETED`, `CANCELLED`, `ERROR`).
- `TransactionSubstatus` (`enum`): detailed transaction sub-state for payment processing outcomes.
- `TransactionType` (`enum`): transaction business type (`BUY`, `PAYMENT`, `REFUND`, `COUPON`, `SUBSCRIPTION_PAYMENT`).
- `TransactionCreatedEvent` (`record`): module event payload for new transaction creation with debit/credit details.
- `TransactionStatusUpdatedEvent` (`record`): module event payload for transaction status update propagation.

#### Utilities (`util`)

- `AuthUtils`: helper for extracting authenticated user UUID from Spring Security context.
- `DateUtils`: shared date constants (`DEFAULT_ZONE_ID`).
- `FileUtils`: utility for writing plain text or pretty JSON content to files.
- `QueryDslUtils`: pagination and dynamic sorting helpers for QueryDSL queries.
- `RandomCodeGeneratorUtils`: helper generators for PINs, alphanumeric codes, and passwords.
- `UrlUtils`: URL base extraction helper with malformed-input fallback.

### Test support types (for module integration tests)

- `TestApplication`: Spring Boot test app bootstrap with module-wide scanning and method security.
- `BaseIntegrationTest`: shared integration-test base with Testcontainers Postgres + RestAssured setup + event collector lifecycle.
- `TestEventCollector<T extends ModuleEvent>`: captures published module events during tests with lock/clear controls.
- `IntegrationTestConfig`: test configuration providing virtual-thread executor for async listeners.
- `Paths` (`interface`): constants/builders for test endpoint paths.
- `TestDataFactory`: helper service for creating seeded auth users/tokens in tests.
- `TestDataFactory.TestUserData` (`record`): test user/token bundle.
