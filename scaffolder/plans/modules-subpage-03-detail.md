# Modules Phase 03: Module Detail Redesign

Status: done

## Goal

Implement the supplied expanded-module concept as a reusable, responsive detail view driven by each existing module's verified content.

## Scope

- All current `/modules/:slug` paths.
- Plain-language summary, verified capabilities/implementation overview, return-to-catalogue, related modules, and builder CTA.
- Reuse existing module documentation and screen assets where appropriate.
- Explicitly label any schematic as illustrative; don't imply a real architecture integration unavailable in source.

## Dependencies

- Phase 01 capability/content audit.
- Phase 02 design tokens and catalogue components where they are genuinely reusable.

## Tasks

- [x] Build shared responsive detail layout.
- [x] Bind each module slug to existing source-backed summary/capabilities.
- [x] Keep an accurate technical overview and empty/missing-content behavior.
- [x] Link back to `/modules`, related detail pages, and `/builder`.
- [x] Update generator CTA to `/builder`; do not imply the builder preselects the current slug.
- [x] Preserve all route slugs and unknown-slug behavior.

## Done

- All seven details render the source-backed capabilities, core flows, bundle membership and source paths. Identity copy avoids claiming role/permission administration; Wallet is accurately described as backend-only.
- Related-module links, catalogue breadcrumbs, builder navigation, image modal focus/Escape behavior, and unknown-slug state were independently verified.
- Canonical and TechArticle URLs match their routes; Wallet SEO metadata identifies a backend module.

## Next

Phase complete; user visual review at `http://localhost:3334/modules/identity`.

## Open Questions

- None expected after Phase 01.

## Changed Files

- `ui/src/pages/modules/@slug/+Page.tsx`, existing detail data only if required, and page-scoped shared modules styling.

## Verification

### Task checks

- `cd scaffolder/ui && pnpm run typecheck` — passed after the latest application changes.
- `cd scaffolder/ui && pnpm run build` — passed after the latest application changes.
- Independent browser walkthrough verified all slugs, three related detail links per page, unknown slug, source links, modal keyboard behavior, responsive states, reduced motion, canonical/structured URLs, sitemap membership, and no console/page/network errors.
- `git diff --check` — passed.

### Phase gateway

- Combined final verification in Phase 04.

## Rollback Notes

- Revert detail-view composition separately from the catalogue list route.
