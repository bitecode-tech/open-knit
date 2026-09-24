---
name: frontend-module-onboarding
description: Use when creating or auditing a new Open Knit frontend module. Covers module structure, ownership boundaries, backend client and route wiring, app discovery, and required checks.
---

# Frontend Module Onboarding

Use this skill for `open-knit` frontend module creation or for auditing whether a frontend module was added correctly.

## Checklist

1. Create `frontend/modules/<module>/`.
2. Add `frontend/modules/<module>/AGENTS.md` when the module has its own domain flows or reusable surface.
3. Follow the expected module structure when relevant:
   - `clients/`
   - `components/`
   - `pages/`
   - `services/`
   - `types/`
   - `_scaffolder/`
   - optional `hooks/`, `contexts/`, `utils/`, `assets/`
4. Keep module-specific code inside the owning module.
5. Use `_common` for reusable primitives, utilities, and shared models instead of creating cross-module imports.
6. Add or update the module HTTP client so the frontend talks to the backend only through module routes.
7. If the module adds admin pages or navigable surface, wire the module into the relevant `_scaffolder` config and app routing.
8. Keep TypeScript path aliases and imports consistent with existing frontend conventions.
9. If the module changes reusable UI surface, update `frontend/modules/_common/AGENTS.md` or the owning module `AGENTS.md` as appropriate.

## Verification

- Run `cd frontend && pnpm run typecheck`
- Run `cd frontend && pnpm lint` when touching shared UI, hooks, routing, or module boundaries

## Boundary Rule

Avoid direct frontend cross-module imports unless the code clearly belongs in `_common`. If a new shared abstraction is needed, move it into `_common` instead of coupling feature modules together.
