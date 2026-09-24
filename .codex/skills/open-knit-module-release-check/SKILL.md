---
name: open-knit-module-release-check
description: Use when adding, removing, renaming, or exposing an Open Knit module and you need to verify its backend, frontend, scaffolder, and deployment wiring before release.
---

# Open Knit Module Release Check

Use this skill when a user adds, removes, renames, or exposes a module in Open Knit and wants confidence that production wiring is complete.

## What this checks

- Backend module directory exists and contains code plus `AGENTS.md`
- Frontend module directory exists and has scaffolder wiring when expected
- `frontend/src/components/admin/AdminLayout.tsx` references the module config when applicable
- Frontend alias config is present in:
  - `frontend/vite.config.ts`
  - `frontend/tsconfig.json`
  - `frontend/tsconfig.app.json`
  - `frontend/tsconfig.node.json`
- Scaffolder UI catalog/docs wiring is present in:
  - `scaffolder/ui/src/content/scaffolderCatalog.ts`
  - `scaffolder/ui/src/content/moduleDocs.ts`
  - `scaffolder/ui/public/sitemap.xml`
- Scaffolder env registration is present in:
  - `scaffolder/.env`
  - `scaffolder/.env-template`
- `scaffolder/Dockerfile.coolify` copies backend module `AGENTS.md` when UI module docs import it

## Required workflow

1. Normalize names for each module:
   - `public slug`: user-facing URL/catalog name, for example `documents`
   - `backend module`: backend/scaffolder module name, for example `document`
   - `frontend module`: frontend directory/alias name, often same as backend module
2. Run the checker script:

```bash
node /mnt/c/Users/taras/IdeaProjects/open-knit/.codex/skills/open-knit-module-release-check/scripts/check_module_addition.mjs \
  --repo /mnt/c/Users/taras/IdeaProjects/open-knit \
  --module documents:document:document \
  --module ocr:ocr:ocr
```

3. If the script reports failures, fix them before handoff.
4. After code changes, run the relevant verification commands:
   - `cd frontend && pnpm run typecheck` when frontend changed
   - `cd scaffolder/ui && pnpm run typecheck` when scaffolder UI changed
   - `cd scaffolder/ui && pnpm run build` when possible for SSR-sensitive changes
   - backend verification as appropriate for the module

## Interpretation rules

- Treat missing `AVAILABLE_MODULES` entries as blocking.
- Treat missing `MODULE_ALIASES` mapping as blocking when `public slug != backend module`.
- Treat missing `Dockerfile.coolify` copy lines as blocking if `scaffolder/ui/src/content/moduleDocs.ts` imports that backend module guide.
- Treat missing `scaffolder/.env-template` updates as a real gap, not optional documentation drift.
- If a module intentionally has no frontend UI, pass `-` as the frontend module segment and mention that assumption explicitly.

## Final response requirement

Always end your response with a production reminder in plain language. Include this exact point:

- Update production env values and secrets for the new module before deploy, especially `AVAILABLE_MODULES`, `MODULE_ALIASES`, and any module-specific configuration keys.
