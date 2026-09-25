# Project Progress

## Goal

Create a durable Heavy-route plan for an unauthenticated, OpenAI-compatible scaffolder MCP that composes custom OpenKnit project variations and deploys them, with mandatory MCP onboarding guidance and updated generic-task orchestrator instructions.

## Current position

- The active deployment is `scaffolder_mcp_implementation_2026_09_25` in Heavy route.
- Two independent source-discovery lanes mapped the scaffolder UI/API/generator, platform Compose variants, ZIP lifecycle, generated seed login, and available runtime metadata.
- P05-T01/T02 and P05-T04 are complete and independently checked before UI changes: Playwright 1.55.0 and Chromium 140.0.7339.16 are installed, UI typecheck passed, and manual Playwright checks are documented for every changed view.
- Phase 01 MCP/project-generation implementation is locally verified. It includes closed schema validation, required Identity, platform-specific archives, the generated manifest, bounded artifacts, no-auth controls, and corrected project/login UI. The live Responses API surface test remains blocked until a public `MCP_PUBLIC_ORIGIN` is configured.
- Phase 02 guidance and OpenKnit-local generic-task skill have been implemented and locally verified. The user clarified that only OpenKnit's local skill should change; other projects remain untouched. The external harness enforcement portion remains blocked because no consuming harness exists in this repository.
- Phase 03 is active: extend generated manifest with setup details, remove fixed seed credentials from artifacts, and provide accurate harness handoff for tool checks, Docker startup/readiness, admin login, and browser opening. No local harness implementation exists here.
- Phase 05's manual walkthrough found a 1px mobile horizontal overflow at widths <=375px. A UI executor owns the fix, focused E2E coverage, and recheck.
- Generated-app cloud deployment remains blocked until provider, ownership, secrets, cost, and cleanup are chosen. The exact external harness that enforces pre-extraction setup is still unidentified; MCP guidance alone cannot enforce it.

## Next milestone

Complete Phase 02 guidance and the OpenKnit-local generic task skill, then address Phase 03 secret-safe first-run setup and local harness instructions. Continue Phase 05 release work after integration. Resolve a public MCP origin for the live Responses API smoke test. Phase 04 cloud deployment still needs provider/ownership/cost decisions.
