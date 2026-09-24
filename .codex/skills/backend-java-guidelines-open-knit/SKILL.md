---
name: backend-java-guidelines-open-knit
description: Use when writing or reviewing general Java implementation code in the Open Knit backend, including DTOs, mappings, dependency injection, exceptions, and layer boundaries.
---

# Backend Java Guidelines For Open Knit

Use this skill for Java backend work in `open-knit`.

## Purpose

This is a local overlay for general Java coding standards. Use it to enforce the repo's actual conventions instead of relying only on generic Java guidance.

## Priority

Follow rules in this order:

1. `backend/AGENTS.md`
2. `backend/modules/<module>/AGENTS.md`
3. this skill
4. generic Java/Spring skills

## Naming And Readability

- Prefer verbose, intent-revealing variable names over abbreviations.
- Use braces for every `if`, even for single-line branches.
- Put data classes into separate top-level files.
- Prefer imports instead of fully qualified class names inline.

## DTOs And Mapping

- Do not expose internal numeric IDs in public APIs. Expose UUIDs only.
- Prefer `record` DTOs when immutability fits.
- Use MapStruct for normal entity/DTO conversions.
- Keep mapper logic in mapper interfaces or mapper default methods, not scattered through services.

## Dependency Injection

- Prefer constructor injection.
- For plain dependency-injected Spring classes, prefer Lombok `@RequiredArgsConstructor` instead of manual assignment-only constructors.

## Boundaries

- No business logic in controllers.
- Services are transaction boundaries.
- Repositories are data access only.
- Access the database through repository methods, repository `@Query`, or QueryDSL.

## Exceptions And Logging

- Prefer explicit, domain-meaningful unchecked exceptions.
- Do not log secrets, tokens, or sensitive data.
- Keep logs contextual and operationally useful.

## Maintainability

- Avoid formatting-only diffs.
- Prefer small, explicit classes over clever abstractions.
- Reuse existing `_common` utilities before adding new helpers or dependencies.

## Verification

- Run `cd backend && ./gradlew compileJava --warning-mode=none`
- Run targeted tests when behavior changes
