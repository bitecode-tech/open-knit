# Backend Agent Guidance

This file is for repo-specific backend rules only. Use the shared skills for general Java/Spring guidance:
`java-coding-standards`, `springboot-patterns`, `springboot-security`, and `springboot-verification`.

## Project Rules

- Profiles: use `EnvProfile` in `backend/modules/_common/src/main/java/bitecode/modules/_common/model/enums/EnvProfile.java`.
- Database: PostgreSQL, schema-per-module, Flyway per module.
- Demo inserts flag: `demo.inserts.enabled=true` (`DEMO_INSERTS_ENABLED=true`).

## Run Locally

- Linux: `cd backend && docker compose up app`
- Windows/WSL: `cd backend && docker compose -f docker-compose-windows.yml watch app`
- App: `cd backend && ./gradlew bootRun`
- Profiles: set `SPRING_PROFILES_ACTIVE` to `LOCAL`, `DEV`, `STAGE`, or `PROD`.
- The POSIX Gradle wrapper bootstraps Java 25 automatically when the current shell is on a different JDK. It caches that runtime under `~/.cache/open-knit/java-25` by default, or uses `OPENKNIT_JAVA25_HOME` when set.

## Backend Container Workflow

- If you are making larger backend changes, stop the backend container before editing and start it again after the changes are done.
- Treat anything bigger than touching one or two files with one or two-line edits as a larger backend change.
- This rule applies especially to Flyway schema or migration changes.
- Prefer:
  - stop: `cd backend && docker compose stop app`
  - start: `cd backend && docker compose up app`
- On Windows/WSL, use the matching compose file when starting or stopping the backend container.

## Required Checks

- Run `./gradlew test` before finishing backend code changes.
- If you change integration tests, run the relevant `integrationTest` task for the affected module.
- For lower-noise local test runs, prefer `--warning-mode=none` on Gradle commands.
- Run `./gradlew compileJava` before finishing any backend code change.
- Do not introduce new failing migrations.
- Do not add new dependencies unless explicitly requested.

## Formatting

- Follow `./.editorconfig`.
- Key constraints: 4-space indent, continuation indent 8, max line length 180.
- Respect `@formatter:off` and `@formatter:on`.
- Avoid formatting-only diffs and unrelated reformatting.

## Test Layout

- Unit tests: `src/test/unit`
- Integration tests: `src/test/integration`
- Prefer unit tests for most business rules, mappers, validators, branching logic, and pure service behavior because they are faster and cheaper to run.
- Use integration tests when the behavior depends on Spring wiring, transactions, persistence, Flyway schema, security filters, controller contracts, module boundaries, or a real end-to-end flow.
- Cover critical e2e paths with integration tests even when unit tests exist; unit tests are the default for speed, but they do not prove the full stack works together.
- Keep integration tests focused on the smallest meaningful workflow that needs the framework or database, instead of duplicating every unit-test branch.
- Use the shared `integrationTest` source set and task instead of mixing integration tests into `src/test`.
- Keep unit-test resources under `src/test/unit/resources`.
- Keep integration-test resources under `src/test/integration/resources`.
- Keep module-owned integration-test config in the owning module.

## DB Migrations

- Flyway only.
- Never modify applied migrations; add new files instead.
- Treat baseline migrations such as `V1__*.sql` as immutable once used.
- After a baseline exists, make schema changes only through new forward migrations.
- Migration location: `src/main/resources/db/migration/<schema>/`.
- Column order convention:
  - `id` first
  - `uuid` second when present
  - entity-specific fields next, in entity order
  - `created_date` and `updated_date` last

## Module Boundaries

- If module-to-module communication is needed, ask whether the user wants event-driven or direct facade usage.
- Do not create new cross-module links unless explicitly asked.
- Only shared modules: `identity` and `_common`.
- Keep the system a modular monolith that can be split later.

## Module AGENTS Policy

- Every backend module under `backend/modules/<module>/` must have its own `AGENTS.md`.
- Follow `backend/MODULE-AGENTS-MD-FORMAT.md`.
- A module `AGENTS.md` must describe what the module does, its core flows, and its domain scope.
- Update the module `AGENTS.md` in the same change when those areas change.

## Backend Module Template

- Root: `backend/modules/<module>/`
- Java package: `bitecode.modules.<module>/...`
- Required subpackages:
  - `config/`
  - `config/_modules/`
  - `model/`
  - `model/mapper/` for MapStruct and DTO/entity mappers
  - `scheduler/` for scheduled jobs and scheduler-specific orchestration
  - `repository/`
  - `service/`
  - `handler/` if needed
- Resources: `src/main/resources/db/migration/<schema>/...`
- Demo inserts: `src/main/resources/demo-inserts/`

## Adding A New Backend Module

- Add the module to `backend/settings.gradle`.
- Add the module dependency to root `backend/build.gradle` so the app starts with it.
- Create `backend/modules/<module>/build.gradle` and depend only on needed modules.
- Create module `AGENTS.md` and keep it updated with scope, routes, flows, and boundaries.
- Add a module config entry under `config/_modules/` for typed properties or module wiring.
- Add Flyway config if the module owns a schema; store migrations under `src/main/resources/db/migration/<schema>/`.
- Add `application-<module>.yaml` when the module owns config and import it from root `backend/src/main/resources/application.yaml`.
- If the module exposes public or differently-authenticated endpoints, update identity security config inputs so the default JWT chain knows which routes are excluded.
- Add integration tests for module ownership boundaries and auth behavior.
- Register any new cross-module facade explicitly and update the owning module `AGENTS.md`.

## Auditing

- Use existing command/event records for auditing.
- Pattern: `COMMAND -> entity update -> store event payload`.
- Do not introduce full event-sourcing or CQRS frameworks.

## Repo-Specific Conventions

- Expose UUIDs only in public APIs, DTOs, and route params. Do not expose internal numeric IDs.
- Use canonical config constants everywhere; do not inline config key strings.
- Access the database through repository methods, repository `@Query`, or QueryDSL.
- For plain dependency-injected Spring classes, prefer Lombok `@RequiredArgsConstructor` instead of a manual assignment-only constructor.
- Prefer existing `_common` utilities and already included JDK/Spring libraries.
- Do not add new dependencies unless requested.

## Concurrency And Locks

- Prefer DB constraints first.
- For same-row updates, prefer optimistic locking.
- For multi-step workflows, prefer atomic claim updates or row locks when needed.
- Use distributed locks only if DB-based solutions are not enough.
- `InMemoryLock` is only safe within a single JVM.

## Endpoints And Roles

- Every endpoint must declare required role(s).
- Keep role requirements explicit and module-scoped.

## Worktree Notes

- If `AGENTS.worktree.md` exists in `backend/`, treat it as the local override for that worktree and follow the compose details it defines.
