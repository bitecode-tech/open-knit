# Phase 03: Polish and Release Checks

Status: done

## Goal

Finish responsive layout, motion, accessibility, SEO metadata, and visual verification for the landing page and builder route.

## Scope

- Reduced-motion substitutions and restrained entrance/selection motion.
- Responsive checks at 320–1920 px, with visual captures at 390, 768, 1024, and 1440 px.
- Keyboard walkthrough, contrast/focus inspection, route and CTA inspection.
- SEO metadata, canonical URLs, sitemap, and local asset loading.
- UI typecheck and production build.

## Dependencies

- Phases 01 and 02 integrated.

## Tasks

- [x] Disable movement and decorative sweeps under `prefers-reduced-motion: reduce`.
- [x] Confirm all CTAs, navigation, module rows, and menu states are keyboard usable.
- [x] Capture the supplied design reference and running UI at the required widths; inspect top, workbench, and footer.
- [x] Check narrow layout, page overflow, text wrapping, target sizes, and no hover-only actions.
- [x] Confirm root and builder metadata, canonical paths, and sitemap `lastmod`.
- [x] Run `pnpm run typecheck` and `pnpm run build` in `scaffolder/ui`.
- [x] Add a usable mobile menu and move focus to the workbench heading after “Explore modules”.
- [x] Record validation evidence and unresolved environment limits in the plan/progress log.

## Done

- All required viewport and interaction checks have evidence.
- Reduced-motion mode keeps state and content understandable without movement.
- Typecheck and build pass; any failures are resolved or clearly identified.
- No known dead links, failed local assets, console errors, or layout overflow.

## Next

User visual review and follow-up only for in-scope landing-page findings.

## Open Questions

- None currently.

## Verification Evidence

- Tester captured top, workbench, and footer at 390, 768, 1024, and 1440 CSS px; document/body width matched the viewport.
- Routes, metadata, canonical URLs, sitemap, reduced-motion emulation, and mocked module selection passed.
- Typecheck, production build, and `git diff --check` passed.
- Recheck passed: menu starts hidden with accessible state; opens with all links at 48 px; button/Escape close and restore focus; Enter on “Explore modules” focuses `#workbench-title` and sets the anchor.
- No typecheck/build rerun after the small interaction repair; implementation worker ran both successfully after that repair.

## Changed Files

- Expected in landing page styles/assets, metadata, sitemap, and verification evidence under the designated temporary evidence folder.

## Verification

### Task checks

- Manual browser walkthrough of the landing page and `/builder` at desktop and mobile sizes.
- Verify reduced-motion preference, keyboard navigation, and every enabled CTA/control.

### Phase gateway

- `pnpm run typecheck`
- `pnpm run build`
- Screenshots at 390, 768, 1024, and 1440 CSS px, with top, workbench, and footer coverage.

## Rollback Notes

- Revert page-scoped motion/styling and metadata edits independently; retain route move and landing content as one coherent feature slice.
