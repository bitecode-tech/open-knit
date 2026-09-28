# Project Structure

## UI routes and page shell

Vike derives routes from `ui/src/pages/`:

- `/` — [landing composition](../ui/src/pages/index/LandingPage.tsx), [landing header](../ui/src/pages/index/LandingSiteHeader.tsx), and catalogue-backed preview in [LandingWorkbench](../ui/src/pages/index/LandingWorkbench.tsx)
- `/builder` — [Builder page](../ui/src/pages/builder/+Page.tsx), its Generator header and three-stage project/configuration/selection view
- `/about` — [about page](../ui/src/pages/about/+Page.tsx)
- `/modules` — [module catalogue page](../ui/src/pages/modules/+Page.tsx)
- `/modules/:slug` — [module detail page](../ui/src/pages/modules/@slug/+Page.tsx)
- `/notify` — [notification page](../ui/src/pages/notify/+Page.tsx)

[`+Layout.tsx`](../ui/src/pages/+Layout.tsx) provides the Vike page layout and [`+Head.tsx`](../ui/src/pages/+Head.tsx) sets metadata. Headers are page-specific: the landing and module routes keep their site navigation; `/builder` uses its Generator header with a lime cube mark. Its [FoundationStack](../ui/src/pages/index/FoundationStack.tsx) illustration accompanies the responsive equal-width desktop stages. The initial Builder state is `my-application`, inserts enabled, and Subscription Access selected. The Builder has its own selection state; landing preview selections are not transferred to it. Public routes are listed in [`ui/public/sitemap.xml`](../ui/public/sitemap.xml).

## Catalogue and generation contracts

- [`scaffolderCatalog.ts`](../ui/src/content/scaffolderCatalog.ts) defines seven UI modules. `ModuleSummary` carries each backend name and backend/frontend/guidance paths; `frontendModulePath` is nullable and `isLocked` marks Identity as locked. UI slug `documents` maps to backend name `document`.
- [`GET /api/modules`](../ui/server/index.ts) returns runtime backend module availability from [`ScaffolderService`](../src/services/ScaffolderService.ts). It does not supply frontend paths, dependencies, or architecture targets. The landing workbench combines that availability with catalogue paths for a preview only.
- The Builder keeps bundle/module selections in local UI state. Its mode transitions, locked Identity behavior in Modules mode, backend-name mapping, planned-system notification, and download request builder remain in the Builder page. [`/api/scaffold`](../ui/server/index.ts) generates and downloads the ZIP. Browser checks verified request payload mappings; the local endpoint returned HTTP 504, so successful download remains unverified.
- Catalogue presentation and architecture relationships must not be inferred from API responses. The landing preview CTA opens `/builder` without transferring its selections.

The repository root README documents the surrounding `backend/`, `frontend/`, and `scaffolder/` layout and ZIP output under `scaffolder/output/`. The implementation plan is in [`plans/00-overview.md`](../plans/00-overview.md) and its phase documents. Landing visual guidance lives in [`frontend/docs/design/`](../../frontend/docs/design/).
