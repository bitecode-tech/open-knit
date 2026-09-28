# Project Overview

## Product and routes

OpenKnit is a modular full-stack application platform. The scaffolder packages selected backend and frontend modules into a ZIP and always includes `_common`; CLI, API, and generated-application setup are documented in the [scaffolder README](../README.md).

The UI uses `/` for the public landing page, `/builder` for the application generator, and `/modules` plus `/modules/:slug` for the module catalogue. Other routes include `/about` and `/notify`; route files live under [UI pages](../ui/src/pages/).

## UI experiences and boundaries

- `/` presents the landing narrative and a catalogue-backed workbench preview. The preview uses `/api/modules` for backend availability, does not generate an application, and its CTA opens `/builder` without transferring selections.
- `/builder` presents the dark three-panel Generator view: project metadata, configuration mode, and bundle/module selection. The Builder has its own Generator header and FoundationStack illustration; its desktop stages are equal width and adapt responsively. It starts with `my-application`, initial data inserts enabled, and Subscription Access selected. Existing mode transitions, locked Identity behavior in Modules mode, UI-to-backend module-name mapping, planned-system notification, and download request construction are retained.
- `/modules` and `/modules/:slug` remain catalogue pages with their own page headers. They do not share Builder selection state.

The Builder keeps selection state locally. `/api/scaffold` remains the ZIP generation and download endpoint. Browser checks verified the request payload mappings, but the local endpoint returned HTTP 504, so a successful ZIP download is not yet verified. Do not infer routes, module capabilities, frontend/backend relationships, or export behavior from illustrations.

The landing-page narrative and reusable visual rules are documented in the [feature brief](../../frontend/docs/design/FEATURE_LANDING_PAGE.md) and [design system](../../frontend/docs/design/DESIGN.md). The supplied images are art direction. The implementation plan is in [plans/](../plans/00-overview.md).
