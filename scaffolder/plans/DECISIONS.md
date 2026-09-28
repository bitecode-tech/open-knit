# Decisions

## 2026-09-28 — Landing page owns `/`

- **Decision:** Put the new marketing page at the public root, and move the existing generator to `/builder`.
- **Reason:** The current Vike root page is the generator, the landing brief requires a public root experience with a working build CTA, and the user waived root-route backward compatibility.
- **Impact:** Update root/builder navigation, metadata, and sitemap. Preserve the generator flow at the new route.

## 2026-09-28 — Workbench is preview-only

- **Decision:** The landing page will not claim to generate a ZIP or transfer selected modules to the builder.
- **Reason:** The current builder has local state, no query-string restoration, and the availability API does not expose the workbench's proposed architecture/dependency model.
- **Impact:** Label the project view as an example/interactive preview and have the CTA open `/builder` without carrying selections.

## 2026-09-28 — Architecture indicators come from existing data

- **Decision:** Show only backend/runtime availability and frontend/guidance presence justified by the catalog's module paths; do not infer dependencies or database/API features.
- **Reason:** The catalog has paths and descriptions but no typed dependency or architecture-target metadata.
- **Impact:** A small UI adapter may normalize verified paths for display, but no backend/schema change is planned.

## 2026-09-28 — Keep the new theme page-scoped

- **Decision:** Scope the near-black/lime landing tokens and styles to the root landing page.
- **Reason:** The other routes are explicitly out of scope, and existing shared tokens are light/blue.
- **Impact:** Avoid changing the appearance of About, modules, module detail, or notify routes.

## 2026-09-28 — Builder Modules is an existing configuration mode

- **Decision:** Redesign `/builder` as the supplied three-step workspace and render the individual modules panel from the existing Modules configuration mode. Do not create a separate route or alter request/download mapping.
- **Reason:** The Builder already has project metadata, bundles/modules/ready-systems configuration choices, and mode-specific selectors; generation maps their IDs through a stable payload boundary.
- **Impact:** Reuse current selection transitions and actions, including locked Identity, demo-insert behavior, bundle resolution, planned-system notification, and download request mapping. The screenshot-matched ready initial state is recorded separately below.

## 2026-09-28 — Match the Builder reference's ready initial state

- **Decision:** Initialize the redesigned Builder with project name `my-application`, initial data inserts enabled, Bundles configuration active, and Subscription Access selected.
- **Reason:** The user asked to implement the supplied Builder screen, whose initial state visibly shows these values and an enabled “Generate application” action.
- **Impact:** The starting generated payload uses the selected real bundle and demo inserts. Later bundle/module/planned-system selection behavior and request mapping remain on the existing contracts.
