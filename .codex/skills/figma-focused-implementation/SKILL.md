---
name: figma-focused-implementation
description: Implement or review a focused frontend view against a Figma frame, mockup, or supplied UI screenshot, with scoped component reuse, interaction-state coverage, and iterative Playwright comparison. Auto-use for direct visual-reference tasks and for orchestrated tickets or plans that contain Figma or UI-image references.
---

# Figma Focused Implementation

This skill incorporates findings from the SELLO three-view implementation and applies them to focused UI work in Open Knit.

## Activation and orchestration

- Auto-activate when a frontend implementation or review task refers to a Figma file/frame/node, provides a design/mockup/screenshot of the UI, or asks to match a visual UI reference.
- When an orchestrator is active, inspect its plan, ticket, and acceptance criteria for Figma links/nodes or UI screenshots/mockups. Load this skill alongside the orchestrator workflow and pass its scope rules and visual-check requirements to the worker responsible for that view. The user does not need to invoke this skill a second time.
- Treat visual UI references embedded in tickets/specs as in-scope inputs even when the top-level request only says to implement the ticket. Do not trigger on unrelated product imagery, logos, or prose that mentions visual quality without a concrete UI reference.
- With a Figma source, capture the requested Figma node before UI edits and follow the Figma source workflow below. With screenshot-only input, preserve that supplied image as the reference and follow the same focused Playwright comparison; do not pretend it is a Figma frame or require Figma access.
- This skill covers translating/reviewing application UI. For Figma authoring or editing in Figma itself, use the applicable Figma design-authoring skill as well.

## Scope first

1. Identify the exact Figma frame(s), selected view, route, and states the user asked to implement. Treat those frames as the visual source of truth.
2. Inspect the current app route and take a baseline screenshot before edits. Record viewport, route, authentication/data fixture, browser zoom/device scale, scroll container, and the in-scope region. A screenshot of a login/redirect/error page is not a valid view baseline; first establish a deterministic authorized session or label the missing baseline as a blocker.
3. Keep work on the selected content/view. Preserve shared navbar, sidebar, footer, and unrelated page regions, even if they differ from the Figma frame. Compare a shell baseline before and after; do not start a repair loop on shared chrome.
4. Add a navigation item only when the supplied Figma view visibly includes it and repository inspection shows that item is missing. Preserve all existing navigation entries.
5. If the requested view contains the shared shell, reuse it as-is. Do not recreate it inside the page component.

## Inspect and reuse existing UI

- Before building controls, inspect the frontend's common/shared module, existing components, design tokens, icons, and analogous forms/tables/cards.
- Prefer a reusable common component when it can represent the design and behavior accurately. Compose or extend a suitable component before making a view-specific duplicate.
- Keep one-off layout and behavior local to the feature when no common component fits. Do not push a single-screen exception into shared UI without evidence that it is reusable.
- Convert any generated Figma markup into the project's existing framework, styling system, asset conventions, and accessibility patterns. Do not add a new UI or styling library just to consume generated markup.
- Use every visible static asset in its intended place. Keep downloaded assets local according to the applicable Figma workflow; do not leave expiring Figma URLs in application code.

## Capture and compare

1. Before changing UI code, save the source reference for every requested view: capture the exact Figma node when Figma is supplied, or preserve the supplied screenshot/mockup when that is the only source. Record the node and native dimensions when available. For long or multi-state screens, save separate references for relevant states and top/middle/bottom regions; do not rely on a scaled full-page thumbnail to judge text or control geometry.
2. Start the app and capture its current implementation with Playwright at the same viewport and state. Store temporary references and results in the task's designated temp/evidence folder, following repository instructions. Confirm the app response belongs to the current checkout and not an unknown server reusing the port.
3. Make one focused edit to the in-scope component or view. After every visual edit pass, capture a new Playwright screenshot and compare the same crop/viewport to the matching Figma reference. Tooling/configuration-only edits do not require a visual recapture.
4. Fix only mismatches in the requested region. Do not make changes to surrounding shell components merely to reduce screenshot differences outside scope.
5. Continue until layout, typography, spacing, sizing, color, borders, text wrapping, visible assets, and scroll behavior align at normal viewing distance. Record residual pre-existing out-of-scope differences. When device scale or browser font rendering differs, compare at matching CSS viewport and inspect side-by-side/overlay or targeted crops; do not claim pixel equality from differently scaled PNG dimensions.

## Interaction states

Build a control inventory from the frame and behavior requirements before sign-off. For each interactive component, inspect and test the states that apply:

- default/resting
- hover
- pressed/active
- keyboard focus-visible
- selected/checked
- disabled or unavailable
- loading/submitting
- validation error and corrected value
- success/saved
- empty/no-results and request failure/retry for data-driven controls

Check buttons, links, cards, menus, inputs, selects, toggles, table actions, pagination, dialogs, and progress steps. Do not assume a control works because it looks correct. Verify pointer and keyboard operation, accessible name/state, focus order, and visible feedback. Use app conventions for states absent from the static reference; do not invent new product behavior.

For each control, mark which states apply and how each will be verified. A native disabled control should be checked for disabled semantics and visual treatment; it cannot be expected to activate on click. For `aria-disabled` controls that intentionally explain unavailability, verify the accessible state and use a real pointer attempt only when the UI has defined feedback for it. Do not manufacture loading, validation, selected, or success states where the design/product contract has no such behavior.

## Manual Playwright inspection

Perform an explicit browser walkthrough after automated checks:

1. Navigate to the implemented view as a real user would, including its sidebar entry when applicable.
2. Exercise every visible interactive control that is enabled; verify navigation/data effects and error/success feedback. For disabled controls, verify the reason is visible when required and ensure neither mouse nor keyboard activates them.
3. Hover every distinct actionable button/card/menu variant and inspect focus-visible with keyboard navigation. Check pressed state on controls with activation behavior. Confirm interaction states do not shift layout or obscure content. Use screenshots for representative distinct variants/states rather than taking redundant images of identical controls.
4. Check every primary and secondary action is actually visible and reachable. If an action is below the viewport, scroll the page to it and verify it is not clipped, covered, or hidden behind an incorrectly sized container.
5. For long pages, inspect the top, middle, and bottom; confirm the correct element scrolls, no nested scroll trap blocks the form, and the bottom action can be reached. Capture full-page plus viewport screenshots where supported.
6. Test at the design viewport and at the supported narrow viewport. Check document and nested-container horizontal overflow, cropped fields, inaccessible actions, and sticky/fixed elements covering content. Scroll the element that actually owns the content; a browser `fullPage` screenshot may not expand a nested scroll pane. Verify every primary/secondary action is visible at its scroll position and can be reached without clipping or overlay.
7. Inspect the browser console and network for failed assets, route errors, unexpected requests, and API failures.
8. Save screenshots and a concise pass/fail record per view/control group. Fix in-scope defects, recapture, and rerun the relevant interaction.

## Functional and integration checks

- Add focused component tests for selected-state transitions, conditional/disabled states, validation, keyboard activation, error handling, and persistence.
- Add API/controller integration checks for the contracts and authorization that support these views. Test direct unauthorized requests as well as the UI state; client-side hiding is not access control.
- Use deterministic stubs for external services. Do not claim a form saves, calculates, or advances successfully when the server contract or product rule is unresolved.
- Keep evidence labels precise: mocked Playwright auth/API proves UI behavior under that fixture; it does not prove live API integration. Verify the backend route/security/persistence separately with integration tests, and perform browser-to-backend testing only when the local service is available. Record unavailable infrastructure without converting it into a pass.
- When requested, inspect production/shared generic components before building local controls. Reuse them if they express the needed visual and interaction contract accurately; keep view-specific controls local when shared wrappers add conflicting layout, state, or form semantics. Record the inspected alternatives and reason for a local implementation in the evidence notes.
- Run applicable typecheck, lint, build, unit, and integration checks. Manual visual inspection remains required after automated checks.

## Completion

Finish only when every requested view has a saved reference comparison, the visible controls and relevant alternate states have been exercised, long-page actions and scrolling have been checked, focused automated/integration tests pass, and no out-of-scope shell work entered the diff. Present the evidence and ask for human visual sign-off.

### Browser-specific lessons from SELLO

- The application shell can place the page in a nested `overflow-y-auto` content pane. Check which element owns scrolling before using document scroll height or a full-page screenshot; browser screenshots do not expand an inner pane. Scroll that pane normally and capture separate top, middle, and bottom viewports.
- Give Playwright an isolated development port when another app server may already be running. A healthy HTTP response can come from a stale checkout and produce misleading route failures; use a dedicated port and do not reuse unknown servers.
- Playwright treats `aria-disabled="true"` controls as disabled for locator actions even when the element is not natively disabled. Assert the accessibility state, then use real page pointer coordinates when the UI intentionally handles attempted selection with explanatory feedback; verify the route stays on the current step.
- A mocked Admin refresh session still exercises the actual protected route and shell. Intercept refresh and draft APIs explicitly, including GET after create, so reload and save walkthroughs do not depend on an unavailable backend.
- Record whether the initial screenshot reached the requested authenticated route. An unauthenticated redirect is useful environment evidence, but cannot stand in for the focused view's visual baseline.
- Inspect long-label primary actions at the bottom of the page and at narrow widths: a button can be present yet wrap unexpectedly. Check its text wrapping in both the screenshot and an automated assertion when one-line presentation is part of the reference.
- A reference may contain sample data while a real new record must start blank. Record that deliberate difference, identify which values would otherwise be fabricated, and compare structural layout independently of the sample content.
