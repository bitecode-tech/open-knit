# Phase 02: Data-Backed Workbench

Status: done

## Goal

Show visitors an honest, accessible preview of how catalog modules relate to the generated project without implying selection transfer or unsupported architecture.

## Scope

- Use `ModuleSummary` catalog data and the existing runtime module-availability endpoint.
- Respect the existing locked Identity module behavior.
- Derive backend, frontend, and guidance indicators only from verified runtime availability and catalog paths.
- Keep one selection state for desktop and mobile; render a simplified textual summary on mobile.
- Mark project tree/output as an example preview. Primary action opens `/builder` with no implied state transfer.
- Include meaningful loading, error/retry, unavailable, selected, and keyboard-focus states where supported by the API and UI contract.

## Dependencies

- Phase 01 route exists.
- Verified catalog and API contracts: seven catalog entries; runtime API identifies backend module availability; static catalog provides backend name and backend/frontend/guidance paths; no dependency graph or architecture-target contract exists.

## Tasks

- [x] Load availability and intersect it with the static catalog using `backendName` mapping.
- [x] Present module rows with native buttons/toggles and accessible selected state.
- [x] Show accurate available/unavailable states and locked Identity status.
- [x] Derive visual/text architecture targets from verified paths; omit unsupported relations.
- [x] Update preview from the same selection state and visibly label it as illustrative.
- [x] Add `/builder` CTA and secondary in-page anchor navigation.
- [x] Ensure mobile selection uses the same state and does not require diagram panning.

## Done

- A visitor can select/deselect every available optional module by keyboard or pointer.
- Shared verified targets remain emphasized while any selected module contributes that target.
- Runtime/API failure has accessible explanatory text and retry behavior; no fake output is presented as generated.
- The workbench says it is a preview and does not claim to export or preselect builder state.
- No fabricated modules, dependencies, availability states, frontend capabilities, testimonials, or metrics.

## Evidence

- The `/api/modules` UI proxy now maps to the existing upstream endpoint while retaining other proxy paths.
- Tester verified the error/retry UI against the unavailable backend configuration and module selection using a mocked available-module response.
- The live endpoint currently returns 500 because the local backend lacks required root-item environment values; no live module catalog claim is made from this run.
- Tester confirmed keyboard module selection with a deterministic mocked available-module response and confirmed the live error/retry state; this is not live catalog verification.

## Next

Phase 03 visual and interaction verification.

## Open Questions

- None blocking. Keep unsupported selection transfer out of scope unless repository implementation reveals an existing contract.

## Changed Files

- Expected in the landing page, typed data adapter/hooks as needed, and narrowly scoped UI components/styles.

## Verification

### Task checks

- Exercise available, unavailable, locked, loading, and API error/retry states with deterministic local fixtures where needed.
- Verify pointer, Space/Enter, accessible name/checked state, and visible focus.

### Phase gateway

- UI typecheck, production build, and visual/interactions run after Phase 03 integration.

## Rollback Notes

- Remove the workbench data adapter and local components as a unit; do not change the shared catalog API or backend for this page.
