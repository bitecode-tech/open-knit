# Project Diary

## 2026-09-28

- Decision: About follows the supplied two-block illustration, connected process row, and business-benefit cards while retaining the shared landing navbar. About copy uses documented product examples and separates development-time coding-agent guidance from optional AI application features.
- Lesson: A visual reference is art direction, not product evidence; review acceptance criteria for page composition, active navigation semantics, landmarks, metadata, and sitemap freshness before implementation.
- Handoff: About redesign (`about_page_redesign_20260928`) passed typecheck, build, responsive browser review at 390/768/1024/1440/1448 widths, CTA/keyboard checks, and console/network inspection. Evidence is under `/tmp/about-page-redesign-20260928/`.

- Decision: Treat Modules-page categories as explicit editorial taxonomy (Identity; Financial; AI & data), not as technical dependency or runtime availability.
- Decision: Module-detail concepts are layout references. Preserve source-backed capabilities, Core flows, bundle membership, and source paths; omit unsupported claims and everyday/advanced grouping.
- Decision: Module build CTAs go to `/builder`, without claiming module preselection.
- Decision: Keep the modules dark theme local to module routes, including their navigation; do not change unrelated pages.
- Lesson: Verify both not-found content and HTTP status. Unknown module slugs render the correct not-found content but currently return HTTP 200.
- Lesson: When the codebase-memory graph is unavailable, use paired bounded source audits and record the fallback.
- Handoff: Modules redesign and independent verification are complete; preview is available on port 3334. User visual review remains pending.

- Decision: The Builder Modules view remains the existing `/builder` configuration mode. Redesign the three-step UI but preserve catalog IDs, locked Identity, demo inserts, bundle mapping, notification and download behavior.
- Handoff: Deployment `builder_modules_tab_20260928` has paired source audits and a durable phased plan; implementation is the next action.
- Decision: Match the Builder reference's ready state with the real `Subscription Access` bundle, `my-application` project name, and initial data inserts enabled. Mode transitions and request mapping remain unchanged.
- Lesson: Screenshot fidelity can justify changing initial UI defaults when the visual reference explicitly shows a selected real catalog option; record that state decision and exercise the resulting request mapping.
- Handoff: Builder redesign, responsive checks, and UI build are complete. Final visual captures are under `.playwright-mcp/`; local ZIP download remains unverified because API :7070 is unavailable.

- Decision: The supplied `DESIGN.md` is the reusable OpenKnit visual and interaction standard; `FEATURE_LANDING_PAGE.md` is specific to this page; the PNG is art direction, not product truth.
- Decision: Implement only the public landing page in this initial visual overhaul. Existing pages and backward compatibility are outside the requested scope.
- Lesson: Verify real module catalog data, generator routes, and generated output before presenting workbench behavior or product claims.
- Decision: The new landing page owns `/`; move the generator to `/builder` so the landing CTA remains functional. Do not promise compatibility for the old root generator URL.
- Decision: The workbench is an interactive preview. Use catalog paths and runtime backend availability only; do not invent architecture/dependency relationships or transfer selections into the builder.
- Lesson: When local environment values prevent a live availability response, keep the UI's real error/retry state and test selection behavior separately with an explicit mock; do not call that live catalog verification.

- Decision: Replace the landing workbench availability/path preview with a single-selection module browser. Show the selected module's real source paths, capabilities, and link to its full detail route; identify the Wallet frontend path as absent rather than inventing one.
- Lesson: Module descriptions and paths should follow the current catalogue and module documentation. Payment supports mock and Stripe providers, so the old Stripe-only short description was inaccurate.
- Handoff: `landing_workbench_modules_structure_20260928` passed browser interaction/responsive review, UI typecheck, production build, and `git diff --check`. Preview remains at `http://localhost:3334/`; screenshots are under `.playwright-mcp/landing-workbench-modules-structure-20260928/`.
