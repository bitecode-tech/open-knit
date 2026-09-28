# OpenKnit — Design system + landing-page implementation handoff

This package intentionally separates **permanent UI design rules** from the **one-off landing-page feature request**.

## Included files

| File | Purpose | Maintain over time |
|---|---|---|
| `DESIGN.md` | The reusable OpenKnit design system: identity, all colors/tokens, fonts, spacing, surfaces, controls, hover/focus/pressed/disabled/loading/error states, mobile layouts, motion defaults, accessibility, component guidelines, and future-view review checklist | Yes, whenever the OpenKnit design system changes |
| `FEATURE_LANDING_PAGE.md` | A Codex-ready implementation request for the approved three-section public landing page: content, desktop/mobile composition, real module data, SVG architecture graph, animations, state-to-motion matrix, engineering steps, and acceptance tests | Only for this landing-page feature |
| `openknit_landing_reference.png` | Approved visual reference for composition and art direction; illustrative, not authoritative for product features or real module names | Reference only |

## How to hand this to Codex

1. Place the three files together in the repository (e.g. `docs/design/`), or update relative references if you relocate them.
2. Ask Codex to **read `DESIGN.md` first** and reuse established tokens, component variants, and accessibility/motion rules. Treat it as the permanent guide for later pages, forms, and product UI as well.
3. Ask Codex to read `FEATURE_LANDING_PAGE.md` second, inspect the actual repository/module registry/generator, then implement the page without inventing unavailable capabilities.
4. Use the PNG as visual direction, **not** a pixel-perfect specification. The production hero should be spacious; the interactive workbench should begin in the next section.
5. Request screenshot comparisons at 390, 768, 1024, and 1440 CSS pixels, keyboard/reduced-motion checks, and verification of all live CTA destinations.

**Suggested Codex instruction:**

> Read `DESIGN.md` as the shared, reusable visual and interaction design system. Implement `FEATURE_LANDING_PAGE.md` as a distinct feature request, using `openknit_landing_reference.png` only as composition/art direction. Inspect current app components, module registry, builder routes, and generated project output before coding. Reuse existing styling and component primitives. Include responsive behavior, every relevant component state, the exact section-level animation choreography, reduced-motion fallbacks, and tests/visual QA. Never fabricate capabilities or claim a preview button exports real code unless connected to generation.

## Future features

For every future view, **keep `DESIGN.md`** and write a new brief (for example, `FEATURE_MODULE_CATALOG.md`). Put feature-specific copy, wireframes, data contracts, routes, custom interactions, and any carefully justified token exceptions **in the feature brief**, not inside the permanent design system.
