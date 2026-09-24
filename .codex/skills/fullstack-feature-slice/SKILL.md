---
name: fullstack-feature-slice
description: Use when implementing or reviewing an Open Knit feature that spans a backend module and its matching frontend module, including their HTTP boundary.
---

# Fullstack Feature Slice

Use this skill when a feature should be delivered as a matched backend and frontend slice rather than as a one-sided change.

## Default assumption

In this repo, most feature work should update both sides unless the user explicitly asks for backend-only or frontend-only work.

## Workflow

1. Identify the owning backend module and owning frontend module.
2. Find the backend controller route for the feature.
3. Find or create the matching frontend HTTP client for that route.
4. Keep request and response DTOs aligned across the boundary.
5. Keep business logic inside backend services and frontend module services, not in controllers or page components.
6. Respect module boundaries:
   - backend modules communicate only through allowed boundaries
   - frontend modules do not import each other directly except through shared `_common`
7. Update module `AGENTS.md` files when flows, responsibilities, APIs, or reusable surfaces materially change.
8. If the change adds a new module or new public module surface, also check `_scaffolder` wiring where applicable.

## Minimum checks

- Backend:
  - `cd backend && ./gradlew compileJava --warning-mode=none`
  - relevant backend tests
- Frontend:
  - `cd frontend && pnpm run typecheck`
  - `cd frontend && pnpm lint` when shared UI, hooks, or routing changed

## Review lens

When reviewing, treat these as common failure modes:

- backend route changed but frontend client still targets old path
- DTO fields diverged between controller and client usage
- backend added a feature but frontend module was not updated
- frontend added UI that bypasses the intended module client
- module docs were left stale after changing the feature flow
