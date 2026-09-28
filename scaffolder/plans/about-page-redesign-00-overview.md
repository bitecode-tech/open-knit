# About Page Redesign — Overview

## Objective

Redesign `/about` around the user-supplied reference image (`/home/hubert/Downloads/ChatGPT Image Sep 28, 2026, 07_27_22 PM.png`) and explain OpenKnit's practical value in a clear, source-backed way. Continue using the shared landing-page navbar.

## Scope

- Replace the existing About page content and styling with the reference's dark technical visual language: lime mono labels, strong display typography, an architectural stack illustration, connected three-step explainer, and outlined benefit cards.
- Add below-the-fold context that explains what teams receive, how module-based composition and coding-agent guidance help, and which real application use cases the foundation suits.
- End with working Builder and module-catalogue calls to action.
- Mark About as the active route in the existing shared navigation when appropriate.
- Keep page metadata and sitemap correct; avoid backend, generator-contract, and unrelated-page changes.

## Verified Content Boundaries

- OpenKnit generates an editable React/TypeScript/Vite frontend and Java/Spring backend foundation with selectable modules; it is not a hosted no-code product.
- Project guidance for AI coding tools is distinct from optional AI capabilities in a generated application.
- Describe identity, payments, transactions, wallets, AI, OCR, and documents as examples only when wording reflects each catalogue entry accurately. Do not imply every item is a complete full-stack module.
- Do not promise quantified delivery speed, production readiness, autonomous AI behavior, reliability improvements, external-provider independence, or business results.
- A landing-page module preview does not configure Builder selections. Link to Builder without implying state transfer.

## Page Story

1. **Why OpenKnit exists:** the product gives a team a structured, editable starting point for its application so it can spend more attention on its own workflows.
2. **How it comes together:** choose a foundation; use the included project guidance with a coding agent; build product-specific business logic.
3. **Who it helps:** use documented product examples such as CRM/ERP systems, subscription products, B2B ordering, and B2C products. AI can appear as an optional application capability and as a separate development-time workflow.
4. **What teams work with:** explain inspectable generated source, module boundaries and examples, and the documented technology stack.
5. **Next step:** visit Builder or browse the module catalogue.

## Acceptance Criteria

- `/about` uses the same shared landing navbar, with About identified as the current page; no page-local navbar is introduced.
- At 1448×1086 (or the closest available CSS viewport), the hero uses two columns with copy on the left and a two-block lime wireframe illustration over a subtle grid on the right; a connected three-step row follows; a divider introduces a section heading and three side-by-side benefit cards.
- The illustration matches the reference's two unlabeled floating blocks, neon outlines, and faint technical grid. The existing four-layer labeled `FoundationStack` is reused only if it can meet those features; otherwise use a page-local decorative SVG.
- At 390px and tablet/desktop widths, the hero, stack graphic, process steps, benefit cards, and CTAs reflow without horizontal overflow or clipped actions.
- Added copy matches verifiable project behavior and keeps builder generation separate from illustrative or future ideas; its use cases match the root README and optional AI functionality is qualified.
- About is the active shared navigation link with `aria-current="page"`. The page has a skip link to its `<main>` landmark; ordered steps, headings, CTA links, focus states, and the decorative diagram are semantic and keyboard usable.
- The About title/description and AboutPage structured-data description accurately reflect the revised copy; canonical URL and sitemap entry remain intact, with About `lastmod` updated.
- UI typecheck and production build pass; browser review covers desktop/mobile, navigation, CTAs, and console/network errors.

## Phases

1. **Plan and gap audit:** map current route and product facts; identify omissions in this draft acceptance/content plan before production work.
2. **Implement About page:** replace page body, create route-local styling, reuse existing illustration where it fits, and set the About active-nav state.
3. **Verify and close:** compare at desktop/mobile, exercise links and navigation, run typecheck/build, record evidence and handoff.

## Risks

- The reference image is illustrative; its content must not be treated as a claim of product capability.
- The current shared nav uses its landing layout and has only a Modules active state. About needs an additive active state without changing other route behavior.
- The root page and About page load different page-local style scopes; About's dark theme must not bleed into other routes.
- The current About metadata overstates code ownership without vendor lock-in and uses ambiguous "AI-friendly structure" wording. Revise both descriptions to explain editable generated source and development-time guidance accurately.
- Use-case examples in the screenshot are art direction; anchor the final examples in the repository README. Do not imply every generated selection includes the same agent guidance or runtime AI modules.

## Review Rounds

- **Round 1 — route and content discovery:** confirmed static `/about` route, shared landing navbar in `+Layout.tsx`, available FoundationStack and link button, README use cases, module examples, and development-time guidance distinction.
- **Round 2 — independent gap audit:** paired reviewers identified missing composition specifics, illustration pass conditions, `aria-current`, main/skip-link accessibility, metadata/structured-data copy, sitemap `lastmod`, documented use-case examples, and the exact Builder route. Acceptance criteria now capture these checks.

## Closure

- Status: implemented and verified.
- Next: collect user visual feedback at `/about`; refine only if requested.
- Handoff: branch `feat/openknit-landing-page` is at `305c0d1`, matching `origin/feat/openknit-landing-page`; About implementation and documentation changes remain uncommitted. No commit or push was requested. Preserve local generated artifacts in `.playwright-mcp/` and `ui/temp/`.
