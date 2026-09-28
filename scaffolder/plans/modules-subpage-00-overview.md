# Modules Subpage — Implementation Plan

Status: implementation and independent verification complete; user visual review pending.

## Objective

Implement the supplied modules catalogue and expanded module-detail concept in the existing OpenKnit scaffolder UI, reusing the current catalog, route structure, and reusable design system.

## Scope

- `/modules` catalogue: concept-led hero, filter/search controls where supported by current catalog, responsive module-card grid, and a build CTA.
- `/modules/:slug` detail: shared hero language, selected module identity, plain-language overview, accurate capabilities, technical summary, and links to other modules/builder.
- Source ZIP extracted into `../frontend/docs/modules-design/openknit_modules_package/`.
- Apply the supplied concepts at phone, tablet, and desktop sizes while keeping the new visual rules scoped to `/modules` routes.
- Use the current UI catalog and module docs as product truth. Adapt or omit any concept copy/claims not backed by current module documentation/source.

Out of scope: landing page or builder changes; backend/API changes; redesign of About/notify; adding new product capabilities, modules, or docs pages; changing the module catalog's domain behavior.

## Assumptions

- Existing `/modules` and `/modules/:slug` routes remain canonical.
- Current landing design tokens in `frontend/docs/design/DESIGN.md` are the shared visual baseline; module concept PNG/HTML are page-specific art direction.
- Module descriptions and capabilities must be verified. The screenshots illustrate design and include claims that may not apply to every module.
- Search/filter controls may only expose categories/capabilities represented in existing typed catalog/documentation; do not invent classification metadata merely to match the mockup.
- Existing destinations and modal behavior should be reused when valid.
- Editorial categories are a deliberate UI grouping: Identity → Application core; Payment/Wallet/Transaction → Financial; AI/OCR/Documents → AI & data. This does not claim availability or technical dependency.
- The catalog count will say “modules in catalogue,” not “available modules,” since local runtime availability is environment-dependent and Wallet has no frontend module.

## Phases

1. **Source truth and design mapping** — verify module page routes, content registry, component reuse, destination links, and identify concept claims that must be adapted.
2. **Catalogue redesign** — implement responsive hero, real-data cards, supported search/filter behavior, and CTA.
3. **Detail redesign** — implement reusable module detail structure and verified content for all current slugs; preserve existing technical docs links/content where accurate.
4. **Visual and interaction verification** — capture required widths, check all route slugs, search/filter/link controls, responsive layout, keyboard/focus, reduced motion, metadata, typecheck/build.

## Risks

- The concept mockups contain possibly fabricated “available” status, capabilities, stack flows, and a seven-module count. Verify each before use.
- Existing module detail docs may have content/data contracts beyond the identity example. Preserve all existing supported slugs.
- Current global shell and module routes recently changed with the landing page. Avoid regressions to other routes and keep modules page styling scoped.
- The codebase-memory service is currently returning `Transport closed`; source discovery will use the repository as fallback until the graph recovers.
- Existing search already works; category controls should compose with search and update the result count without breaking its empty state.

## Immediate Next Action

User visual review of `/modules` and `/modules/identity` on the running preview at port 3334.

## Completion Handoff — 2026-09-28

- All four phases are complete. UI typecheck and production build passed after the final application changes; independent browser verification passed route, interaction, responsive, accessibility, and SEO checks. Evidence is under `/tmp/modules-subpage-verification/`.
- Preview: `http://localhost:3334/modules` and `http://localhost:3334/modules/identity`. Port 3333 is owned by an unrelated process and was left untouched.
- Known route constraint: an unknown slug renders not-found content but returns HTTP 200.

## Verified Source Audit — 2026-09-28

Two independent source explorers agreed on route, content, and contract findings. `/modules` already has deferred text search, a no-results state, seven catalog-driven cards, and responsive layout. `/modules/:slug` already binds each of seven catalog slugs to backend `AGENTS.md` Core flows, bundle membership, and source paths. Keep public slug `documents`; backend name is `document`. No `/modules/document` alias exists. Unknown slugs render not-found.

The package has overview and Identity detail comps; static HTML controls are nonfunctional and CSS is fixed at 1440 px. Catalog has no category field and no Everyday/Advanced capability grouping. Add only an editorial category mapping for the requested chips; present existing capabilities and core flows without inventing subgroups.

Identity supports sign-in/session tokens, account registration/verification, recovery, email/TOTP MFA, Google OAuth2 linking, and admin user operations. Its source supports assigned role-based access but not role/permission administration. Payment is Stripe payments/subscriptions with a non-production mock provider. Wallet is backend-only and command-driven. Transaction functionality is scoped to payment activity. AI lists OpenAI/Ollama/Azure provider support, chat, agents, knowledge ingestion, and transcription. OCR has documented OpenAI extraction; Documents supports user-owned files and local/S3-compatible storage.

Stale “Go to generator”/“Generate with OpenKnit” CTAs in both module routes point to `/`, now the landing page; update to `/builder`. The concepts' nav has “How it works” and “Docs”, but no matching routes exist; retain the real shared navigation without dead destinations. Sitemap and module metadata/structured data already contain all module routes; review `lastmod` for changed pages.

The codebase-memory service returned `Transport closed` in this session. Current source and the two independent fallback audits are authoritative. Graph coverage was reported stale/partial by the explorers.
