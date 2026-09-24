---
name: backend-spring-guidelines-open-knit
description: Use when implementing or reviewing Spring Boot application structure in the Open Knit backend, including controllers, services, configuration, security wiring, and module boundaries.
---

# Backend Spring Guidelines For Open Knit

Use this skill for Spring Boot architecture and application-structure decisions in `open-knit`.

## Purpose

This is a local overlay for general Spring Boot patterns. It captures how this repo wants Spring code organized.

## Controllers

- Controllers are transport boundaries only.
- Keep them thin: map request DTOs, validate inputs, delegate to services.
- Controllers should not contain business logic.
- Controllers should not use `@Transactional`.
- Every endpoint must have explicit role or auth requirements.

## Services

- Services own orchestration and transaction boundaries.
- Keep workflows in services, not repositories or controllers.
- Prefer explicit service methods that match the use case.

## Repositories

- Repositories are for persistence access only.
- Keep query logic in repositories or QueryDSL implementations, not services.

## Configuration

- Prefer typed module configuration.
- If a module owns config, add `application-<module>.yaml` and import it from the root application config.
- Use canonical config constants instead of inlining config key strings.
- Follow the existing `EnvProfile` conventions from `_common`.

## Module Safety

- Respect the modular-monolith boundary.
- Do not add new cross-module links unless explicitly asked.
- If module-to-module communication is needed, ask whether to use event-driven communication or a direct facade.
- Only shared modules are `_common` and `identity`.

## Auth Wiring

- If a module exposes public or differently authenticated endpoints, update the identity security configuration inputs so route exclusions are explicit and intentional.
- Route exclusion from the default JWT chain is not a replacement for auth design.

## Operational Rule

- Treat Flyway, config imports, security wiring, and integration-test ownership as part of module completion, not follow-up cleanup.

## Verification

- Run `cd backend && ./gradlew compileJava --warning-mode=none`
- Run relevant backend tests
- Run `cd backend && ./gradlew test --warning-mode=none` before finishing larger backend changes
