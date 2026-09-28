# Phase 01: Route and Visual Foundation

Status: done

## Goal

Make the new landing page the public root route and preserve the existing generator at `/builder`.

## Scope

- Move the current root generator page and its route data into `/builder`.
- Add a new `/` page and page-scoped styles/assets.
- Update the shared layout only as needed for landing-page scrolling, navigation destinations, and root-only styling.
- Update page metadata/canonical behavior and `/` plus `/builder` sitemap entries where needed.
- Build header, hero, CTA pair, modest architectural stack, section transitions, workbench shell, process steps, and footer structure.
- Follow the supplied design system and keep the desktop first viewport sparse.

## Dependencies

- `agent_docs/` intake complete.
- Source audit confirms Vike routes, existing shell, shared metadata, and sitemap.
- `DESIGN.md`, `FEATURE_LANDING_PAGE.md`, and supplied PNG are available in `../frontend/docs/design/`.

## Tasks

- [x] Preserve current generator behavior while moving its page/data files to `/builder`.
- [x] Add a new landing page at `/` with semantic sections and scoped dark/lime styling.
- [x] Keep About, modules, module-detail, and notify page visuals unchanged.
- [x] Ensure header and CTAs link to actual local routes.
- [x] Update route metadata and sitemap for the public root and builder route.

## Done

- `/` renders the new landing page and can scroll through all sections.
- `/builder` renders the existing generator and keeps its generation path.
- Other page routes retain their existing appearance and behavior.
- Root metadata describes OpenKnit accurately; builder metadata describes the generator.
- No horizontal overflow or clipped content at 320–1920 CSS px.

## Next

Complete module catalog/runtime integration and accessible workbench behavior in Phase 02.

## Open Questions

- None blocking. Copy avoids the feature brief's unverified “business-ready” wording.

## Changed Files

- Expected under `ui/src/pages/`, landing page-local CSS/assets, route metadata, shared layout/nav, and `ui/public/sitemap.xml`.

## Verification

### Task checks

- Inspect generated routes and confirm root and builder render the intended pages.
- Compare the new root against the supplied reference at 1440 px during implementation.

### Phase gateway

- UI typecheck and production build.
- Visual capture at 390, 768, 1024, and 1440 px; inspect top, workbench, and footer.

### Evidence

- Implementation worker: typecheck/build passed; `/` and `/builder` returned 200.
- Independent Tester: `/`, `/builder`, `/about`, `/modules`, `/modules/identity` returned 200 with expected content/canonical URLs; sitemap returned 200; no horizontal overflow at 390/768/1024/1440 px.
- Tester rechecked mobile menu state, link target sizes, Escape close/focus restoration, and workbench anchor focus; all passed.

## Rollback Notes

- Revert the landing root page and route move together; do not leave the existing generator files stranded outside a route.
