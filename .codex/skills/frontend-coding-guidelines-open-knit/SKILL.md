---
name: frontend-coding-guidelines-open-knit
description: Use when implementing or reviewing Open Knit frontend TypeScript or React code to apply repository conventions for module structure, shared `_common` reuse, clients, services, and code hygiene.
---

# Frontend Coding Guidelines For Open Knit

Use this skill for frontend code in `open-knit`.

## Purpose

This is a local overlay for general TypeScript and React guidance. Use it to enforce the repo's real frontend conventions.

## Priority

Follow rules in this order:

1. `frontend/AGENTS.md`
2. module-local conventions
3. this skill
4. generic TypeScript and React skills

## Module Structure

- Feature code lives in `frontend/modules/<module>/`.
- Shared primitives, utilities, and cross-module UI belong in `frontend/modules/_common/`.
- App shell code that is not module-specific lives in `frontend/src/`.

## Common Module Layout

Use the existing module pattern when relevant:

- `clients/`
- `components/`
- `pages/`
- `services/`
- `types/`
- `_scaffolder/`
- optional `hooks/`, `contexts/`, `utils/`, `assets/`

## Types And Components

- Keep types explicit.
- Use `PascalCase.tsx` for components and `useX.ts` for hooks.
- Keep shared types in module `types/` directories.
- Keep component files focused and explicit instead of over-abstracted.

## Shared Reuse

- Reuse `_common` primitives, config, hooks, utilities, and models before creating a duplicate in a feature module.
- If something is broadly reusable, move it into `_common` instead of introducing cross-module coupling.

## Clients And Services

- Use `clients/` for backend HTTP integration.
- Use `services/` for module logic and orchestration that should not live directly inside page components.
- Keep frontend/backend communication aligned with backend module routes.

## Naming And Hygiene

- Prefer verbose, clear names over short abbreviations.
- Avoid `any`.
- Avoid stray debug logging in production code.
- Avoid formatting-only diffs and unrelated cleanup while making functional changes.

## Verification

- Run `cd frontend && pnpm run typecheck`
- Run `cd frontend && pnpm lint` when touching shared UI, hooks, routing, or module boundaries
