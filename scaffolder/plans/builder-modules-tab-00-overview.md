# Builder Modules Configuration — Plan

## Objective

Redesign the existing `/builder` experience to match the supplied dark three-step composition, with the Modules configuration selected and its real module choices visible. Preserve project generation, module mapping, default/locked modules, bundle/planned-system modes, and current route behavior.

## Scope

- Recompose the existing Builder into project metadata, configuration selection, and mode-specific options panels.
- Add a source-backed module selection presentation matching the screenshot's card and footer-summary style.
- Reuse the landing page's visual tokens, header, typography, mobile navigation, and visual language where appropriate.
- Keep existing configuration modes available and functional.
- Preserve `handleGenerate`, request payloads, bundle mapping, notification flow, and existing availability semantics.

Out of scope: backend/client changes, new generation features or module availability rules, changes to `/modules` catalogue or landing content, and new routes.

## Verified contracts

- `/builder` has three steps: project metadata, configuration, and mode-specific choices.
- Configuration modes include bundles, individual modules, and planned systems. The current state/selection handlers own mode transitions and locked Identity behavior.
- Static catalog option IDs are mapped to backend names at generation; `documents-module` maps to backend module `document`.
- `handleGenerate` and `HttpClient.downloadScaffold` own generation/download behavior. Planned systems use the existing notification flow.
- Runtime `/api/modules` data is not currently used to filter Builder options. Preserve that behavior.

## Architecture

Retain the page's domain state and payload adapters in `ui/src/pages/builder/+Page.tsx`. Extract only focused view pieces and styling if useful: a three-panel desktop grid that stacks cleanly on small screens, mode-aware cards, persistent selection summary/action area, and project metadata controls bound to current state.

## Phases

1. **Implementation plan and contract map** — complete paired Builder audits and record UI/data/generation seams. Complete.
2. **Builder visual implementation** — recompose Builder with the supplied design, preserve all mode and generation behavior, add responsive states, and validate typecheck/build.
3. **Independent verification and handoff** — verify mode selection, module selection/defaults, project fields, initial data toggle, generate/notify behavior, responsive layout, keyboard/reduced motion, route navigation, and production build; update project handoff docs.

## Risks

- New presentation can accidentally alter generated module payloads or the locked Identity default.
- Screenshot copy and labels must not imply capabilities unsupported by module summaries; use real option descriptions and existing bundle names.
- Current Builder has local generation form state. Preserve it during the visual refactor.
- Header is shared with the landing page for `/` and `/modules`; do not regress their navigation while Builder receives its referenced visual system.

## Immediate Next Action

User visual review at `http://localhost:3334/builder`; successful ZIP generation remains dependent on the local scaffolder API being available.
