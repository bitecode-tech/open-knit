---
name: backend-module-onboarding
description: Use when creating a backend module or auditing an existing module's setup in Open Knit. Covers module registration, required layout, schema, configuration, security wiring, and completion checks.
---

# Backend Module Onboarding

Use this skill for `open-knit` backend module creation or for auditing whether a backend module was added correctly.

## Checklist

1. Register the module in `backend/settings.gradle`.
2. Add the module dependency to root `backend/build.gradle`.
3. Create `backend/modules/<module>/build.gradle` with only required dependencies.
4. Create `backend/modules/<module>/AGENTS.md`.
5. Follow the package and layout convention:
   - `bitecode.modules.<module>`
   - `config/`
   - `config/_modules/`
   - `model/`
   - `repository/`
   - `service/`
   - `handler/` if needed
6. If the module owns configuration, add `application-<module>.yaml` and import it from `backend/src/main/resources/application.yaml`.
7. If the module owns a schema, add Flyway config and place migrations in `src/main/resources/db/migration/<schema>/`.
8. If the module exposes public or differently authenticated endpoints, update identity security configuration inputs so the default JWT chain knows those routes are excluded.
9. Add integration tests for:
   - auth behavior
   - cross-user isolation
   - forged UUID access
   - module-specific happy path
10. If the module participates in cross-module communication, ask the user to choose event-driven vs direct facade before adding new module links.

## Security Note

Do not treat route exclusion from the default JWT chain as a substitute for module-specific authentication or authorization. Exclude routes only when they are intentionally public or protected by another mechanism.

## Verification

- Run `cd backend && ./gradlew compileJava --warning-mode=none`
- Run the affected module integration tests
- Run `cd backend && ./gradlew test --warning-mode=none` before finishing larger backend changes
