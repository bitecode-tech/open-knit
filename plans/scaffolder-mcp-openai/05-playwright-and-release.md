# Phase 05: Playwright, UI Acceptance, and Release

Status: not started

## Goal

Install a supported Playwright browser-testing toolchain for the scaffolder UI and make manual browser acceptance a required gate whenever a view changes. Complete release wiring and the scaffolder version update.

## Scope

- `scaffolder/ui` package scripts, dev dependencies, lockfile, Playwright config, and browser install instructions.
- A focused end-to-end/manual path through project selection, validation feedback, generation/download, and any changed instructions/status views.
- UI guidance and release versioning.

## Dependencies

- MCP and generation flows integrated; if the UI is unchanged, keep UI checks scoped to the existing flow and avoid unnecessary UI redesign.
- Playwright and Chromium must be installed before the first view or interaction change; perform this phase's setup tasks early when needed rather than waiting until final release verification.
- Generated-app deployment decision and Phase 4 gateway completed if `deploy_project` is included in the release.

## Tasks

[x] P05-T01. Add and pin Playwright in the scaffolder UI package (recommend `@playwright/test`) and add deterministic `test:e2e`/headed test scripts and a checked-in config using the project's supported Node/pnpm versions. **Implementation gate:** complete this before any UI view or interaction change.
[x] P05-T02. Install the target browser (Chromium minimum); document `pnpm exec playwright install chromium` and required Linux browser libraries. CI may install dependencies with the supported Playwright install command. **Implementation gate:** complete this before any UI view or interaction change.
[ ] P05-T03. Add focused automated coverage for catalog selection, validation errors, generate/download handling, and any newly changed onboarding/deploy view. Avoid tests that depend on external deployment providers.
[x] P05-T04. Update `scaffolder/ui/AGENTS.md` with browser setup and the acceptance rule: if a view or interaction changes, manually drive the affected flow with Playwright against the running UI and API, inspect visible states/errors/download behavior, and record evidence before continuing/merging. A passing typecheck or unattended test suite alone does not satisfy this manual gate.
[~] P05-T05. Manually test every changed view in a real Playwright browser session: primary project flow, empty/invalid selection, loading/failure state, successful download, and responsive layout where affected. Save screenshots/trace under the UI's gitignored `temp/` directory. Core flow, required Identity, platform confirmation, empty-name error, success/download, loading, and API/network failures were checked. **Open defect:** project metadata view has 1px horizontal overflow at 375px and below; fix and repeat the affected manual browser check before proceeding.
[ ] P05-T06. Run `pnpm run typecheck`; run applicable lint and automated Playwright checks. Record browser/version, command, result, and manual observations.
[ ] P05-T07. Bump `scaffolder/package.json` version for a deployment to `main` according to the scoped release instructions; keep the UI version label sourced from that package version.
[ ] P05-T08. Update scaffolder documentation and release/deployment container wiring for `/mcp`, `/api/instructions`, artifact storage/TTL, HTTPS, Origin validation, and operator limits. Confirm the app is actually being deployed through the intended scaffolder hosting path.

## Done

- Playwright and its required browser are installed reproducibly for local development and CI.
- Required manual Playwright checks for every changed view are recorded and pass before implementation is considered ready.
- UI typecheck and applicable lint/e2e checks pass.
- Release version and hosting docs match the shipped feature and expose no credentials.

## Next

Update `PROGRESS_LOG.md` with phase gateway evidence and move this plan to completed only after all accepted phases pass.

## Open Questions

- Which CI workflow should own browser installation and Playwright execution?
- Does the release change any public sitemap entry? Update `public/sitemap.xml` only if SEO-relevant public pages change.
- Does the selected MCP hosting surface terminate HTTPS and preserve the MCP Streamable HTTP headers/Origin behavior?

## Changed Files

Expected: `scaffolder/ui/package.json`, `pnpm-lock.yaml`, new Playwright config/tests, `scaffolder/ui/AGENTS.md`, `scaffolder/package.json`, hosting docs/config, and `plans/scaffolder-mcp-openai/PROGRESS_LOG.md`.

### Prerequisite checkpoint — 2026-09-25

- **Completed early:** P05-T01, P05-T02, and P05-T04. UI Playwright dependency/config/browser setup was performed before Phase 01 view work as required; guidance was updated during that setup.
- **Verified independently:** `pnpm run typecheck` passed; `@playwright/test` 1.55.0 is pinned in package and lockfile; `test:e2e` and `test:e2e:headed` exist; Chromium 140.0.7339.16 launched headlessly at `/home/hubert/.cache/ms-playwright/chromium-1187/chrome-linux/chrome`; `scaffolder/ui/temp` artifacts are ignored; manual changed-view gate is documented.
- **Not completed:** P05-T03 and P05-T05 through P05-T08 remain pending for release integration. No E2E specs existed at the verification checkpoint and no E2E suite was run.
- **Next:** Resume Phase 05 release tasks after generation, guidance, and local setup integration; manually exercise each view change as it occurs.

## Verification

### Task checks

- `cd scaffolder/ui && pnpm install` (or the repository's frozen-lockfile CI equivalent); `pnpm exec playwright install chromium`; `pnpm run typecheck`; applicable lint; `pnpm run test:e2e`.
- Perform the required manual Playwright browser walkthrough for every changed view and retain concise evidence in the plan/PR.
- Smoke the hosted no-auth `/mcp`, `/api/instructions`, and artifact lifecycle on staging; verify origin rejection, no-auth connection, and no-cache/expiry behavior as designed.

### Phase gateway

- Run the configured scaffolder service/UI checks sequentially, followed by OpenAI client connection checks on staging. If generated-app deployment is enabled, include a sandbox deploy and cleanup. No deployment claim passes without captured evidence.

## Rollback Notes

The MCP endpoint, instructions route, artifact retrieval, and generated-app deploy tool must each be independently disableable. On release regression, disable the failing capability and retain the current ZIP API if healthy. Preserve only artifacts still within the published retention policy.
