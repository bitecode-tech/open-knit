# Latest Session Work

## 2026-09-25 — Scaffolder MCP planning

- **Goal:** Produce a durable phased plan for a no-auth, OpenAI-compatible scaffolder MCP with custom project composition and deployment, MCP onboarding instructions, generic orchestrator tasks, and Playwright setup/manual UI verification.
- **Completed:** Created and read the six required canonical `agent_docs/` files; confirmed indexed OpenKnit and BitInvoice projects; compared two independent source discovery reports and three independent OpenAI/MCP research reports; wrote the phased plan and decisions under `plans/scaffolder-mcp-openai/`.
- **Verified:** `scaffolder/src/server.ts` exposes the ZIP generation API; `ScaffolderService` delegates to a generator that returns a ZIP path. No generated-app deployment operation exists in that flow. BitInvoice MCP is authenticated and domain-specific. The inspected orchestrator implementation accepts generic tasks; the precise Notion-gated consumer prompt/config remains to locate. OpenAI surfaces document Streamable HTTP, but Responses API documentation does not guarantee initialization-instruction injection or resource reads.
- **Next:** Resolve Phase 1 decisions: exact orchestrator prompt/skill/config to edit, supported OpenAI client matrix, generator option schema and anonymous artifact limits, plus the generated-app deployment provider and ownership model.
- **Blocker:** Generated-app deployment phase is blocked until the target and owner/credentials/cost/cleanup policy are chosen. A hard setup-before-extraction gate must be implemented in the consuming harness.
- **Implementation status:** None. Plan and agent documentation only. No tests or deploy operations were run.

## 2026-09-25 — Local setup and first-login plan update

- **Goal:** Add user requirements for dynamic SDK checks/install, OS-specific Compose selection, and local admin login/browser startup to the existing scaffolder MCP plan.
- **Deployment:** `scaffolder_mcp_plan_update_2026_09_25`.
- **Completed:** Added required UI/API/MCP `targetPlatform` input (`windows`, `linux`, `macos`); require one selected default Compose stack in the archive. Added generated `open-knit-project.json` with Java/Node/pnpm/Docker/Compose requirements sourced from project configuration. Added Phase 03 for local host checks/install, Docker daemon startup, readiness, unique local admin password, and opening the login page.
- **Verified:** Container workflow provides Java 25 and Node 22/pnpm 10.32.1; current root Compose variants are Linux and Windows/WSL, no macOS variant. Current generated admin seed is `admin@bitecode.tech`, uses `DEMO_INSERTS_USERS_PASSWORD` with demo inserts enabled, and initializes once per database. Existing Compose has no healthchecks and no confirmed Actuator health endpoint. `/login` currently resolves on port 3030.
- **Next:** Implement target platform templates, manifest derivation, and the harness flow; choose exact OS package channels and a safe admin-readiness signal. No source code was changed.
- **Constraints:** Remote MCP cannot inspect/install software on the user's host; the consuming harness must have local machine tools and request approval for elevated installs. Existing DB volumes must not be reset or shown credentials that were not seeded.
- **Implementation status:** Plan and project-doc update only. No checks, installs, Docker operations, or deployments were run.

## 2026-09-25 — Scaffolder MCP implementation kickoff

- **Goal:** Execute `plans/scaffolder-mcp-openai/` in Heavy route, beginning with required Playwright setup before any UI view edits.
- **Active task:** P05-T01/T02. A worker owns `scaffolder/ui` Playwright dependency/config and local guidance only; no UI views are being changed yet.
- **Also in progress:** Two read-only Explorer lanes are locating the exact Notion-gated orchestrator instruction and the consuming harness's local setup boundary.
- **Implementation scope:** Public no-auth OpenAI-compatible MCP, project spec including `targetPlatform`, one selected Compose stack, instructions and generated docs, local setup manifest/harness handoff, admin login/browser flow, generic task guidance, and required Playwright gating. The cloud app-deployment phase remains blocked pending provider/ownership/cost choice.
- **Preserve:** Existing user changes in `backend/docker-compose.yml` and `.playwright-mcp/`; do not rewrite them.
- **Next:** Finish Chromium install plus UI typecheck; then record P05 task evidence and advance to the MCP/project-generation contract. No source implementation checks have been run yet.

## 2026-09-25 — Playwright precondition passed; Phase 01 active

- **Goal:** Implement the saved scaffolder MCP plan under Heavy route, deployment ID `scaffolder_mcp_implementation_2026_09_25`.
- **Completed:** P05-T01/T02/T04 were implemented and independently verified before UI edits. Playwright 1.55.0 is pinned; Chromium 140.0.7339.16 launches headlessly; `pnpm run typecheck` passes; E2E artifact paths are ignored; `scaffolder/ui/AGENTS.md` requires manual Playwright walkthroughs after view changes. No E2E suite was run because no specs existed at that point.
- **Discovery:** Two independent lanes mapped the API/UI/generator/composition path and confirmed missing target platform, manifest, bounded artifact lifecycle, and Windows/macOS handling. They also found that UI seed flags are ignored by API and the success modal advertises fixed `test123` before startup. Code-graph MCP failed on the first main-agent call with `Transport closed`; both Explorer lanes retried successfully and corroborated source reads.
- **Active:** Phase 01, P01-T01 through P01-T10. A bounded executor owns scaffolder production changes. The Phase 01 ledger records discovery evidence and the Playwright gate result.
- **Blockers:** Phase 04 cloud deployment awaits a provider and ownership/cost/cleanup decision. The exact consuming local harness/Notion-gated entrypoint remains unknown; generic task guidance can be added to generated project instructions, but a pre-extraction gate needs a named harness.
- **Next:** Integrate and verify the no-auth MCP, shared project specification, target-platform archive generation, source-derived project manifest, and bounded artifact retrieval. Then continue Phase 02 and Phase 03; keep cloud deploy disabled until its decision is recorded.

## 2026-09-25 — Phase 01 locally verified; Phase 02 active

- **Completed locally:** Phase 01 generation/MCP work and independent verification. Eleven scaffolder tests passed; TypeScript, service/UI builds, and UI typecheck passed with the documented environment configuration. Legacy GET ZIP requests worked. MCP protocol checks confirmed a closed nested schema and required Identity. Linux, Windows, and macOS archives returned 200 with one matching Compose stack and source-derived manifest values.
- **Manual UI evidence:** Playwright 1.55.0 with Chromium 140.0.7339.16 checked required Identity, platform confirmation reset, invalid name feedback, and successful ZIP download. Screenshots and trace are in gitignored `scaffolder/ui/temp/`; loading/failure and responsive observations remain for Phase 05 acceptance.
- **Blocked external check:** No live Responses API call was made because no public `MCP_PUBLIC_ORIGIN` exists. P01-T01/T10 remain blocked for that live surface smoke test; local implementation work can continue against the verified project contract.
- **Phase 02:** Active. Two independent Explorer lanes found no consuming harness in this repository, no existing OpenKnit Notion-gated skill, no `/api/instructions` or MCP resources, and stale copied README/`README-run` content. The user explicitly directed that only the OpenKnit-local `.codex/skills/` skill be made generic; other projects remain unchanged.
- **Important Phase 03 gap:** Current generated backend `.env` still carries the default `DEMO_INSERTS_USERS_PASSWORD=test123`; remove it from generated artifacts and have the trusted local harness set a unique password before first seeding. No local SDK/Docker installation, app readiness, credential presentation, or browser-open harness has been implemented yet.
- **Next:** Finish the canonical guide, MCP resource/HTTP endpoint, accurate generated README/AGENTS, and project-local generic-task skill. Then implement safe local bootstrap guidance and login readiness. Keep live OpenAI smoke and cloud deployment as separate external gates.

## 2026-09-25 — Phase 02 complete locally; Phase 03 active

- **Phase 02 completed locally:** canonical versioned guide is shared by MCP initialization, resource, `/api/instructions`, generation result, and generated README/AGENTS. The OpenKnit-local generic task skill is `.codex/skills/open-knit-generic-task/SKILL.md`; no global or other-project skill was changed. P02 executor reported 13 tests, typecheck/build, and skill validation passing.
- **External harness blocker:** repository contains no consuming harness to verify instructions-before-extraction or task creation/execution without Notion. Keep P02-T02 and the consuming-harness portion of P02-T07 blocked; the local skill and protocol guide provide the safe handoff but do not enforce arbitrary clients.
- **Phase 03 active:** P03-T01/T02 are satisfied by Phase 01 platform-specific ZIPs. An executor owns manifest completeness and removal of `test123` from generated `.env`; a trusted local setup consumer must still be identified before claiming SDK installs, Docker daemon launch, readiness, secret presentation, or browser opening.
- **UI acceptance:** manual Playwright has verified project selection, required Identity, platform confirmation reset, empty-name validation, successful archive download, loading, API errors, and network errors. It found a 1px horizontal overflow at viewport widths <=375px. A UI executor owns the minimal repair and focused E2E/manual browser recheck.
- **Still gated:** live Responses API smoke needs public `MCP_PUBLIC_ORIGIN`; generated-app cloud deployment needs provider/ownership/cost/cleanup decisions. Preserve user changes in `backend/docker-compose.yml` and `.playwright-mcp/`.
