# Backend Agent Guidance

## Configuration

- **Profiles:** use `EnvProfile` in `backend/modules/_common/src/main/java/bitecode/modules/_common/model/enums/EnvProfile.java`.
- **Database:** PostgreSQL, schema-per-module, Flyway per module.
- **Demo data flag:** `demo.inserts.enabled=true` (env: `DEMO_INSERTS_ENABLED=true`).

## Run Locally

- **Docker Compose:** from `backend/` run `docker compose up -d`.
- **App:** `./gradlew bootRun` (API on `http://localhost:8080`).
- **Profiles:** set `SPRING_PROFILES_ACTIVE` (e.g., `LOCAL`, `DEV`, `STAGE`, `PROD`).

## Must Pass

- `./gradlew test`
- No new failing migrations
- No new dependencies unless explicitly requested

## Typecheck (required)

- ALWAYS run a compile/typecheck step before finishing any task that touches code in this directory.
- Use this command (no unit tests):
    - `./gradlew compileJava`
- If you modify/add tests, also run only the specific tests you changed (e.g.):
    - `./gradlew test --tests "bitecode.modules.transaction.TransactionPaymentTest"`

## Formatting (mandatory)

- Source of truth: `./.editorconfig` (IntelliJ-exported). Read and follow it for all edits.
- Key constraints (from `.editorconfig`):
    - `indent_style=space`, `indent_size=4`, `tab_width=4`
    - `ij_continuation_indent_size=8`
    - `max_line_length=180` (do not introduce lines >180 unless unavoidable, e.g., URLs or long string literals)
- Formatter tags are enabled:
    - Respect `@formatter:off` … `@formatter:on` blocks; do not change formatting inside them.
- Avoid formatting-only diffs:
  - Do not reformat unrelated code. Limit formatting changes to the minimum required around the edited lines/files.
- If a change causes widespread reformatting, revert the reformatting and re-apply only the functional change.

## Tests (example)

- Prefer module integration tests that extend module test base (e.g. `TransactionIntegrationTest`).
- Example (event-driven transaction creation):

```java
package bitecode.modules.transaction;

import bitecode.modules._common.shared.payment.model.enums.PaymentGateway;
import bitecode.modules._common.shared.payment.model.enums.PaymentStatus;
import bitecode.modules._common.shared.payment.model.enums.PaymentType;
import bitecode.modules._common.shared.payment.model.event.PaymentCreatedEvent;
import bitecode.modules._common.shared.transaction.model.enums.TransactionDebitType;
import bitecode.modules._common.shared.transaction.model.enums.TransactionStatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionSubstatus;
import bitecode.modules._common.shared.transaction.model.enums.TransactionType;
import bitecode.modules.transaction._config.TransactionIntegrationTest;
import bitecode.modules.transaction.repository.TransactionEventRepository;
import bitecode.modules.transaction.repository.TransactionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.testcontainers.shaded.org.awaitility.Awaitility.await;

public class TransactionPaymentTest extends TransactionIntegrationTest {

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    TransactionEventRepository transactionEventRepository;

    @Autowired
    ApplicationEventPublisher eventPublisher;

    @Test
    @Transactional
    public void shouldCreateNewTransactionAfterReceivingPaymentConfirmedEvent() {
        var userId = UUID.randomUUID();
        var paymentId = UUID.randomUUID();
        var paymentCreatedEvt = PaymentCreatedEvent.builder()
                .userId(userId)
                .paymentId(paymentId)
                .amount(BigDecimal.valueOf(123.319))
                .type(PaymentType.RECURRING)
                .status(PaymentStatus.CONFIRMED)
                .currency("pln")
                .gateway(PaymentGateway.MOCK)
                .build();

        eventPublisher.publishEvent(paymentCreatedEvt);

        var transactions = await()
                .atMost(5, TimeUnit.SECONDS)
                .until(() -> transactionRepository.findAllByUserId(userId), list -> !list.isEmpty());
        assertThat(transactions.size(), is(1));

        var txn = transactions.getFirst();

        assertThat(txn, allOf(
                hasProperty("userId", is(userId)),
                hasProperty("type", is(TransactionType.SUBSCRIPTION_PAYMENT)),
                hasProperty("status", is(TransactionStatus.COMPLETED)),
                hasProperty("subStatus", is(TransactionSubstatus.DONE)),
                hasProperty("debitTotal", is(BigDecimal.valueOf(123.32))),
                hasProperty("debitType", is(TransactionDebitType.CARD)),
                hasProperty("creditTotal", is(BigDecimal.valueOf(123.32))),
                hasProperty("creditType", is(notNullValue())),
                hasProperty("creditCurrency", is("pln"))
        ));
    }
}
```

## DB Migration Policy

- **Tooling:** Flyway only.
- **Rule:** never modify applied migrations; always add new migration files.
- **Location:** `src/main/resources/db/migration/<schema>/`.

## Module Communication & Boundaries

- **Decision required:** if module-to-module communication is needed, ask the user whether they want **event-driven** (more complex to maintain) or **direct service/facade** usage.
- **Default communication:** domain events (publish/consume) only if the user chooses it.
- **Allowed alternative:** explicit facades when the user chooses direct usage.
- **Separation rule:** modules must stay isolated; do **not** create new cross-module links unless explicitly asked.
- **Only shared modules:** `identity` (auth) and `_common`.
- **Monolith goal:** modular monolith that can be split into services later (avoid hard coupling).

## Module AGENTS.md Policy (required)

- Every backend module under `backend/modules/<module>/` must have its own `AGENTS.md`.
- Module `AGENTS.md` structure and required sections must follow `backend/MODULE-AGENTS-MD-FORMAT.md`.
- A module `AGENTS.md` must describe:
  - what the module does
  - core flows
  - domain scope (entities, subdomains, and boundaries)
- Any module change that affects these areas must include an explicit update to that module's `AGENTS.md` in the same change.
- This documentation update is a required step for developing/extending a module (not optional follow-up).

## Backend Module Template (strict)

- **Root:** `backend/modules/<module>/`
- **Package:** `bitecode.modules.<module>/...`
- **Required subpackages:**
  - `config/`
  - `config/_modules/` (module init/seed/config entry points)
  - `model/`
  - `repository/`
  - `service/`
  - `handler/` (if command/event handlers are used)
- **Resources:** `src/main/resources/db/migration/<schema>/...`
- **Demo inserts:** `src/main/resources/demo-inserts/` (no extra subfolders)

## Audit Events

- Use existing command/event records for auditing (e.g., `transaction.transaction_event`).
- Pattern: `COMMAND -> entity update`, then store event payload for traceability.
- Do not introduce full event-sourcing/CQRS frameworks.

## Conventions

- No business logic in controllers.
- Do not log secrets or tokens.
- Controllers should not use `@Transactional`.
- Repositories should not use `@Transactional` unless required for correctness.
- Services are transaction boundaries.
- Repositories are data access only.
- Prefer constructor injection.
- Public APIs return consistent error format.
- No direct SQL execution from services/controllers/agents. Database access must go through:
  - repository methods
  - repository `@Query`
  - QueryDSL queries (typically in custom repository implementations), especially for variant/dynamic queries that depend on optional parameters
- **Configuration keys (searchability):**
  - If a config value has a constant name (e.g., `DEMO_INSERTS_ENABLED`), always reference it by that constant throughout the codebase (no inline strings like `"demo.inserts.enabled"`).
  - When adding a new config key, define a single canonical constant and use it everywhere.
    Configuration keys
## DTO / Lombok Patterns

- Prefer Java `record` for DTOs and commands when immutability is desired.
- Use Lombok `@Builder` on records when you need fluent construction (events/commands).
- For entities: use Lombok `@Getter`/`@Setter` and constructor injection in services.

## Entities & IDs

- Use `UuidBaseEntity` for externally exposed entities; use `BaseEntity` when UUID is not required.
- Never expose internal numeric `id` in APIs; expose UUID only.
- Single-item GET endpoints must use UUID in the route.
- Entity basics: `@Entity`, `@Table(schema = "...")`, Lombok `@Getter/@Setter`, and quote reserved column names via `@Column(name = "\"type\"")` when needed.

## Concurrency / Locks

### Preferred order of solutions

1) Enforce invariants at the DB level (unique/check constraints).
2) For updates on the same entity/row: use optimistic locking (`@Version`) and handle `OptimisticLockException` (retry or 409, depending on endpoint semantics).
3) For multi-step workflows: use an atomic DB “claim” step (e.g., status transition `PENDING -> PROCESSING` with `WHERE status='PENDING'`) or row locks (`SELECT ... FOR UPDATE`)
   when necessary.
4) If cross-instance mutual exclusion is required and cannot be expressed safely via DB constraints/claims/row locks, use a distributed lock (Redis). Do not add Redis or change
   infra unless explicitly requested by the user.

- **In-memory:** `InMemoryLock` coordinates only within a single JVM instance.
- If deployment runs >1 instance (pods/servers, blue/green), **do not** use `InMemoryLock` for correctness.

## Shared Utilities (use before writing custom code)

- **Services:** cache (`CacheService`), email (`EmailService`), locking (`InMemoryLock`).
- **Utils:** `AuthUtils`, `DateUtils`, `FileUtils`, `QueryDslUtils`, `RandomCodeGeneratorUtils`, `UrlUtils`.
- Prefer existing `_common` utils, standard JDK/Spring features, and already included libraries (e.g., Guava).
- Do not introduce new deps unless requested.

## Endpoints & Roles

- Every endpoint must declare/require its role(s).
- Keep role requirements explicit and module-scoped.

## REST Controller Essentials

- Use HTTP methods semantically (GET, POST, PUT, PATCH, DELETE).
- Use resource‑oriented URIs (nouns, consistent casing); avoid verbs in paths.
- Return correct status codes (200/201/204/400/401/403/404/409/500).
- Use DTOs for request/response; never expose entities directly.
- Handle errors consistently (single global handler + stable error shape).
- Validate inputs at the boundary; never trust raw request data.

### Example (controller)

```java
@RestController
@RequestMapping("/admin/transactions")
class AdminTransactionController {

    @GetMapping("/{uuid}")
    public TransactionDto getOne(@PathVariable UUID uuid) {
        return transactionService.getByUuid(uuid);
    }

    @PostMapping
    public ResponseEntity<TransactionDto> create(@Valid @RequestBody CreateTransactionDto dto) {
        var created = transactionService.create(dto);
        return ResponseEntity.created(URI.create("/api/v1/transactions/" + created.uuid()))
                .body(created);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> delete(@PathVariable UUID uuid) {
        transactionService.delete(uuid);
        return ResponseEntity.noContent().build();
    }
}
```

## Spring Boot Core Rules

- **Main app class:** keep it minimal, annotated with `@SpringBootApplication` (no business logic in `main`).
- **Stereotypes:** use `@RestController`, `@Service`, `@Repository`, `@Configuration`.
- **Constructor injection only (Lombok):** dependencies are explicit and testable.
- **Typed config:** prefer `@ConfigurationProperties` over scattered `@Value`.
- **Profiles/conditional wiring:** use `@Profile` / `@ConditionalOnProperty` with `EnvProfile` constants.
- **Scanning:** keep component scanning narrow (module packages only).
- **Scheduling:** enable in config, use externalized intervals, handle errors.

### Example (constructor injection)

```java
@Slf4j
@Service
@RequiredArgsConstructor
class UserService {
    private final UserRepository userRepository;
}
```

## Scheduling (essentials)

- Use configurable cron/intervals, preferably in environment variables, not hardcoded values.
- Use @Scheduled(cron = "...")
- Wrap scheduled logic in try/catch; do not let exceptions kill the app.
- Failsafe batch processing: scheduled/batch jobs must be resilient per-record.
- If processing a record fails, mark that record as `FAILED` and persist a failure reason (and timestamp) in the database.
- Do not fail the whole batch because of a single record, unless explicitly required for consistency.
- Prefer per-record transactions (or savepoints) so a single failure does not rollback other records.
- If some steps are irreversible (e.g., external provider calls) and failure happens after partial execution, mark as `PARTIALLY_FAILED`, persist the error reason, and persist which steps were executed (e.g., step list / last successful step / provider reference IDs) in the database for replay/compensation.

```java
public record CreateTransactionDto(UUID userId, UUID paymentId, BigDecimal amount) {}
public record TransactionDto(UUID uuid, UUID userId, BigDecimal amount, String status) {}
```

```java
@ControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<ErrorDto> notFound(NotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorDto("NOT_FOUND", ex.getMessage()));
    }
}

public record ErrorDto(String code, String message) {}
```

## Where to Put New Code

- **Module-specific:** always in its module (`backend/modules/<module>/...`).
- **App-level (non-module):** `backend/src` with clear domain separation.

## Consistency Rules

- Favor reuse of `_common` services/utilities.
- Avoid cross-module references except `identity` and `_common`.
- Keep modules clean and swappable for future service extraction.

## Do Not Break

- **Security:** never weaken auth/authorization, role checks, or token handling.
- **Security changes:** do not alter security unless explicitly asked. If a change is required, ask the user twice and explain pros/cons and risks before proceeding.
- **Backwards compatibility:** avoid breaking existing API contracts or events without user approval.
- **DB migrations:** do not alter or reorder applied migrations; add new migrations only.

## Security Notes

- Never commit API keys or secrets.
- Use environment variables for configuration.
- Keep dependencies updated.
- Review security advisories regularly.
