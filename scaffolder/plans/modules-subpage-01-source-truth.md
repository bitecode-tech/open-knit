# Modules Phase 01: Source Truth and Design Mapping

Status: done

## Goal

Map current module catalogue/detail behavior and reconcile it with the new concepts before implementation.

## Scope

- `/modules`, `/modules/:slug`, all current module slugs, catalog types, detail content/docs, shell links, metadata and sitemap.
- Compare overview and Identity-expanded concept with `DESIGN.md` and current product truth.

## Dependencies

- `modules_overview.png/.html` and `modules_expanded_identity.png/.html` in the supplied package.
- Existing `frontend/docs/design/DESIGN.md`.

## Tasks

- [x] Confirm every supported slug and route entry.
- [x] Map existing catalog/detail copy and verified capability sources.
- [x] List unsupported concept claims that must be omitted or labeled illustrative.
- [x] Confirm the intended module selection/build CTA destination.
- [x] Set page-specific content and visual architecture before implementation.

## Done

- Decision-ready contract note is present in the overview and no product-truth uncertainty blocks implementation.

## Findings

- All seven current routes exist and bind to source-backed catalog/docs data; unknown slugs show not-found.
- Overview currently supports search only. Curated editorial categories are required for the concept filters.
- Keep module capabilities and backend guide core flows. Omit unsupported “permission management”, module-wide “available” status, everyday/advanced grouping, and invented integration claims.
- Redirect the stale module generator CTAs from `/` to `/builder`; no module preselection contract exists.
- Concept HTML is static art direction and fixed-width, so implementation must supply real controls and responsive behavior.
- Graph MCP is unavailable (`Transport closed`); paired explorers verified source directly.

## Next

Phase complete; Phases 02–04 implementation and verification are complete.

## Open Questions

- Decide conservatively from source; ask user only if an evidence-backed gap changes product scope.

## Changed Files

- `plans/modules-subpage-*` only.

## Verification

### Task checks

- Compare HTML concept labels/content and image with current catalog/docs.

### Phase gateway

- Not applicable; discovery/planning phase.

## Rollback Notes

- No application changes in this phase.
