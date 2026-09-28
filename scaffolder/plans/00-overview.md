# OpenKnit Landing Page — Implementation Plan

## Objective

Replace the scaffolder UI's current root generator page with the new OpenKnit public landing page from `../frontend/docs/design/`. Give the existing generator a dedicated `/builder` route so the new landing page has a working primary action.

## Scope

- Landing page at `/`: site header, sparse hero, interactive module workbench, three-step explanation, and footer.
- Generator route move from `/` to `/builder` and the minimum shared-shell, metadata, sitemap, and navigation updates required for those routes.
- Landing-scoped design tokens and styles based on `DESIGN.md`.
- Workbench data from the verified static module catalog plus the runtime availability endpoint.
- Responsive behavior, keyboard accessibility, reduced-motion behavior, page metadata, and visual verification.

Out of scope: backend changes; selection transfer from the workbench into the builder; changes to About, module catalog/detail, or notify page designs; later visual overhaul pages; new UI libraries; claims or module relationships not present in verified product data.

## Assumptions

- The user wants the landing page to own `/`, and has explicitly waived compatibility with the prior root-page URL.
- The generator remains reachable at `/builder`; its existing workflow is retained.
- The workbench is a preview. Its CTA opens `/builder` without silently transferring the workbench selection.
- Catalog module availability comes from the existing runtime module API. Backend, frontend, and guidance lanes are derived only from catalog paths and runtime availability.
- Identity stays visibly locked/included as the current generator defines it. Do not invent dependencies, “coming soon” states, or ready-system bundles.
- The supplied PNG guides composition and art direction; `DESIGN.md` and verified application behavior control implementation details.

## Phases

1. **Route and visual foundation** — move generator to `/builder`; install the landing route and scoped shell/style; add semantic responsive section structure and hero illustration.
2. **Data-backed workbench** — connect catalog/runtime availability, accessible module selection, honest architecture targets, derived example preview, and CTA to `/builder`.
3. **Polish and release checks** — implement reduced-motion and responsive behavior, metadata and sitemap updates, then complete viewport, keyboard, visual, typecheck, and build checks.

## Risks

- The root page currently owns generator state and root metadata. Moving the route can break deep links; the user has waived backward compatibility, but all landing CTAs and navigation must use `/builder`.
- Runtime module availability describes backend modules; catalog paths separately describe frontend and guidance assets. Do not imply that a backend module necessarily has a frontend feature or guidance file.
- Existing app-wide light/blue styles and constrained root scrolling conflict with the supplied dark, scrolling marketing page. Keep the new visual system scoped to `/` so other pages retain their existing appearance.
- The graph index is stale and has coverage gaps. Current checkout source is authoritative for changed or missing symbols.

## Immediate Next Action

Feature implementation and verification are complete. The next action is user visual review; follow-up should stay within the landing page scope unless the user expands the redesign.
