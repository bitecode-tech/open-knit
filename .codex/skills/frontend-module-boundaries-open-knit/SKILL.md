---
name: frontend-module-boundaries-open-knit
description: Use when adding or reviewing an Open Knit frontend change that affects module ownership, cross-module reuse, or a new module surface. Applies the repository's rules for `_common`, module HTTP clients, routes, and `_scaffolder` wiring.
---

# Frontend Module Boundaries For Open Knit

Use this skill when a frontend change risks coupling modules together or when a new module surface is being introduced.

## Core Rule

Keep module boundaries explicit.

- Module-specific UI, services, hooks, types, and pages stay inside the owning module.
- Avoid direct cross-module imports unless the code is clearly shared.
- Prefer `_common` for reusable utilities, config, and UI primitives.

## Ownership Rules

- A feature module owns its own `clients/`, `components/`, `pages/`, `services/`, and `types/`.
- App shell code belongs in `frontend/src/`.
- Reusable cross-module UI belongs in `_common`.

## Backend Alignment

- Frontend modules should communicate with backend modules through their HTTP clients.
- Do not bypass the intended module client from page or component code.
- Keep routes and DTO usage aligned with the backend controller surface.

## Scaffolder And Routing

- If a module adds admin pages or visible navigation surface, update the relevant `_scaffolder` config.
- Keep module discoverability and route wiring explicit rather than implicit.

## Common Failure Modes

- importing feature code directly from another feature module instead of `_common`
- building API calls directly inside page components
- adding reusable UI in one feature module that should live in `_common`
- exposing a new frontend module surface without wiring `_scaffolder` or routes

## Verification

- Run `cd frontend && pnpm run typecheck`
- Run `cd frontend && pnpm lint` when boundaries, routes, shared UI, or hooks changed
