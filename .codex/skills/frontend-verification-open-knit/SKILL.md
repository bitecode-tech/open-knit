---
name: frontend-verification-open-knit
description: Use when finishing or handing off an Open Knit frontend change and you need the repository's required verification checks, including conditional checks for scaffolder UI.
---

# Frontend Verification For Open Knit

Use this skill before handing off frontend work in `open-knit`.

## Default Checks

For any frontend code change:

- run `cd frontend && pnpm run typecheck`

## Run Lint When

Run `cd frontend && pnpm lint` when the change touches:

- shared UI
- hooks
- routing
- module boundaries
- formatting-sensitive code

## Scaffolder UI Checks

If the change touches `scaffolder/ui`, also run:

- `cd scaffolder/ui && pnpm run typecheck`

When possible for SSR-sensitive or public-page changes, also run:

- `cd scaffolder/ui && pnpm run build`

## Change Review Checklist

Before finishing, verify:

- the owning module still contains its own feature code
- `_common` was reused where appropriate
- backend routes and frontend clients still match
- `_scaffolder` wiring is updated when new pages or modules were introduced
- there is no stray debug logging or dead exploratory code
