# Project Diary

## 2026-09-28

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
