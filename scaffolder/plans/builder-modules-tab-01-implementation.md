# Builder Modules Tab — Implementation

Status: done

## Goal

Implement the screenshot-led `/builder` experience while preserving selection transitions and generation contracts.

## Scope

- `ui/src/pages/+Layout.tsx` only for a `/builder`-specific navigation branch; landing and `/modules` navigation remain on their existing components.
- `ui/src/pages/builder/+Page.tsx` and its focused builder components/styles.
- Reuse the existing catalog option IDs and state transitions.
- Visual composition: hero copy with a layered foundation illustration, equal-width desktop panels for project metadata, configuration mode, and mode-specific choices, plus a summary/action footer.

## Initial State Decision

- Open `/builder` with the existing `subscription-access` bundle selected, `my-application` as the project name, and initial data inserts enabled. This is the real “Subscription Access” catalog bundle and makes the initial Generate action ready.
- Apply that bundle selection only on initial page entry. Further mode changes retain the existing selection reset behavior, locked Identity default in Modules mode, and generation payload mapping.

## Dependencies

- Phase 01 audit in `builder-modules-tab-00-overview.md`.
- Supplied reference image in the user request.

## Tasks

- [x] Recompose the equal-width desktop panels and responsive tablet/mobile layout.
- [x] Render “Compose” in white and “your application foundation” in lime, fitting the full heading on one line at 1672px alongside the layered FoundationStack illustration.
- [x] Match the dark Builder visual language, lime selection state, typography, bordered panels, and green action.
- [x] Bind the project name and initial data insert control to existing Builder state/payload.
- [x] Initialize the screenshot-matching project metadata and real Subscription Access bundle selection.
- [x] Render Bundles, Modules, and planned systems from existing configuration data.
- [x] In Modules mode, render all seven catalog options with the existing locked Identity default and selection behavior.
- [x] Add the current-state summary and generate/download action with its existing disabled/loading/error behavior.
- [x] Keep planned-system notification behavior intact.
- [x] Add a Builder-only dark header with Generator active and only working route links; preserve landing and `/modules` headers.
- [x] Keep the desktop stage centered with 50px side gutters at 1440px and 1672px viewport widths.
- [x] Replace the Builder header’s blue image logo with a lime outlined cube and uppercase OPENKNIT wordmark; retain working links and omit Docs.

## Done

- Builder visually follows the reference at desktop and mobile widths.
- All controls and generation payloads preserve the previous behavior.
- No unsupported module/runtime claims are added.

## Next

Independent Phase 03 verification.

## Open Questions

- None expected; use existing catalog and state as product truth where screenshot copy differs.

## Changed Files

- `ui/src/pages/+Layout.tsx` — render the Builder header only on `/builder`.
- `ui/src/pages/builder/+Page.tsx`, `BuilderChoiceCard.tsx`, `BuilderSiteHeader.tsx`, `builder.css`, and `builderHeader.css` — Builder composition, initial state, header, and scoped styles.
- `.playwright-mcp/builder-refinement-desktop-1672x941.png` and `.playwright-mcp/builder-refinement-mobile-390x844.png` — visual evidence.
- `.playwright-mcp/builder-followup-desktop-1440x941.png`, `.playwright-mcp/builder-followup-desktop-1672x941.png`, and `.playwright-mcp/builder-followup-mobile-390x844.png` — follow-up visual evidence for the fixed stage width and updated heading.
- `.playwright-mcp/builder-final-reference-desktop-1672x941.png` — final header and hero reference match.

## Verification

### Task checks

- `pnpm run typecheck` and `pnpm run build` pass in `ui/`.
- Browser walkthrough confirmed the initial project name, inserts toggle, selected `Subscription Access` bundle, four-module summary, and enabled Generate action.
- At 1672px, the hero and three equal-width panels fit without horizontal overflow. At 390, 768, 1024, 1440, and 1672px, document width matches viewport width.
- Modules mode shows all seven catalog choices, keeps Identity selected and disabled, and accepts optional module selections.
- Captured requests preserved the existing mapping: Subscription Access sent `identity,wallet,transaction,payment` with `counterName=subscription-access`; Identity plus Documents sent `identity,document`.
- Switching from Modules back to Bundles retains the existing empty-selection behavior; Membership Platform still opens the ready-system email notification dialog.
- `/builder` shows the dark header with Generator active; `/` and `/modules` retain their landing-site header. No `/docs` route exists, so the Builder header omits Docs.
- Keyboard Tab reaches the brand and Generator links in order; both show visible focus, and Generator exposes `aria-current="page"`.
- Final visual follow-up: at 1672px, the full heading renders on one line at 57.7px, with “Compose” white and the remaining phrase lime; the FoundationStack illustration remains visible. The header shows the lime outlined cube, uppercase OPENKNIT, Generator active, and no Docs link. At 1440px, the heading also fits on one line and the stage measures x=50, width=1340; at 1672px the stage measures x=50, width=1572. At 390px, the document matches viewport width and the project name and inserts default remain intact.
- The local generation endpoint returned HTTP 504 for both captured requests; the existing high-demand error modal appeared. Successful ZIP download could not be confirmed in this environment.

### Phase gateway

- Independent TypeScript typecheck/build and responsive/interaction verification in Phase 03.

## Rollback Notes

- Revert the Builder page presentation/components/styles without changing catalog mappings, services, APIs, or the landing/modules pages.
