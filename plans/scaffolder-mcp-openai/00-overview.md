# OpenKnit Scaffolder MCP — Overview

## Objective

Add an unauthenticated, OpenAI-compatible MCP interface to the TypeScript scaffolder. It should expose supported project options, validate a project variation, generate a reproducible archive, and provide the guidance an LLM harness needs before extracting, starting, or developing that project. Plan an explicit deployment operation for generated applications after its target and credential/ownership model are selected. Update the consuming development orchestrator so it starts from a generic task rather than requiring Notion.

## Scope

- MCP server hosted with the existing scaffolder service, using remote Streamable HTTP over HTTPS and a protocol revision verified against the intended OpenAI clients.
- Reuse the existing generator and converge MCP/API/UI inputs on one closed project specification.
- Require an explicit target platform (`windows`, `linux`, or `macos`) in frontend/API/MCP project creation. Generate one matching Compose stack in the ZIP under the normal `docker-compose.yml` names; do not ship alternative Windows/Linux filenames as competing defaults.
- Emit a machine-readable generated-project manifest with SDK/runtime versions and startup metadata derived from generated backend/frontend project configuration.
- Have the local user harness inspect the extracted project, detect/install its required host development tools, ensure Docker is running, start the project, wait for the app/admin seed to be ready, show local admin credentials, open the login page, and hand off coding through the Heavy route with an implementation plan kept current.
- Provide server initialization instructions, a stable HTTP instructions endpoint, MCP onboarding/development resources, and setup details in generation results and generated artifacts.
- Generate portable project guidance (`README.md`, `AGENTS.md`) and only add custom skills where a concrete repeatable workflow needs one and the target harness supports its skill convention.
- Add and install Playwright in the scaffolder UI toolchain. Manual Playwright walkthroughs are a required implementation gate whenever a view changes.
- Make orchestrator work accept a generic task (goal, context, constraints, acceptance criteria, verification); Notion can supply optional context but is not a prerequisite.
- Preserve anonymous access: no login, API key, OAuth, or caller identity requirement for MCP.

**UI implementation gate:** Complete Playwright and browser setup (Phase 05, tasks 1–2) before the first UI view or interaction change, even if those setup tasks need to run ahead of the release phase. After each view change, manually exercise the affected flow in Playwright and record the result before continuing with subsequent implementation (Phase 05, task 5).

Out of scope until a product decision: arbitrary Git repositories/scripts, arbitrary deployment hosts, open-ended shell execution, and a public anonymous deployment capability that can incur uncontrolled cost or create cloud resources without an agreed ownership model.

## Verified Current State

- `scaffolder/src/server.ts` is an Express server with `/health`, `/api/modules`, and `/api/scaffold` (also `/scaffold`) routes. Scaffold requests accept `modules`, `name`, and a counter name, run the existing service, and stream a ZIP.
- `ScaffolderService` (`scaffolder/src/services/ScaffolderService.ts`) prepares a run context and delegates to `AppScaffolderService` (`scaffolder/src/services/AppScaffolderService.ts`); the latter prepares backend/frontend outputs and returns a ZIP path. Current generation does not unpack or deploy generated apps.
- The scaffolder UI uses module catalogs and bundles; the ready-systems route currently opens a wishlist flow. UI request flags `demoInsertsEnabled` and `aiEnabled` are not forwarded to the generator today.
- The current Linux root Compose file starts backend, PostgreSQL, and frontend. Its dev containers include Java 25 and Node 22/pnpm 10.32.1, so Docker is the only host runtime needed to start that Compose path. Host-native development separately needs Java 25 and Node/pnpm; the frontend currently lacks an explicit Node engine/version file.
- Compose variants currently distinguish Linux from Windows/WSL; there is no macOS variant. The generator's file allowlist packages Linux-named Compose files only, even though root docs mention the Windows alternative. The generator does not collect target OS.
- The identity module is locked into current selections. Fresh local demo data creates `admin@bitecode.tech` with the password from `DEMO_INSERTS_USERS_PASSWORD` (currently defaulted to `test123`); demo seed runners require `DEMO_INSERTS_ENABLED=true` and run once per fresh database. Current Compose files have no readiness healthchecks, and the backend has no confirmed Actuator readiness endpoint.
- The generated UI login path is `/login` and currently defaults to `http://localhost:3030/login`. Frontend login depends on identity, which the current scaffolder locks into project selections.
- Scaffolder hosting/development files include `Dockerfile.coolify` and `docker-compose.local.yml`; these describe hosting the scaffolder, not deploying generated applications.
- BitInvoice's MCP demonstrates tool schemas and Streamable HTTP, but its OAuth/API-key/account resolution, security filters, and rate limiting are invoice-specific and must not be copied as required authorization for this no-auth service.
- The orchestrator backend already has generic task fields and task-file dispatch; discovery did not find a Notion code dependency in the inspected integration paths. The Notion hard requirement may be in the consuming prompt/skill/config and must be located before editing.

The repository findings above are grounded in the listed source files and the broader discovery handoff in `agent_docs/latest_session_work.md`. The OpenAI Responses API transport reference is the [official MCP servers guide](https://developers.openai.com/api/docs/guides/tools-connectors-mcp); confirm the exact protocol revision and any additional client surface during Phase 1.

## Assumptions and Recommendation

1. V1 supports a finite allowlisted OpenKnit project specification, including required `targetPlatform`, validates it, and generates/downloads an artifact by reusing the existing generator.
2. Keep generation and deployment as separate operations. Define a provider adapter for later deployment, but do not expose `deploy_project` until the target, account ownership, secrets, user confirmation, resource limits, and cleanup policy are decided.
3. Use MCP server `instructions` at initialize, a stable HTTP guide endpoint, and MCP resources. Do not claim these force every arbitrary client to read instructions. Repeat the required setup in tool metadata/results and in generated project files. The consuming harness must inject and present the guide before enabling extraction or commands if that sequence is mandatory.
4. Target OpenAI Responses API with Streamable HTTP and no auth; add HTTP/SSE or ChatGPT Developer Mode only if the Phase 1 client matrix requires and verifies them.
5. MCP tools should return a compact text summary and structured result. Store large ZIPs as bounded-retention artifacts with fixed-origin download URLs/opaque IDs rather than relying on a large inline tool response.
6. The extracted project must contain one selected, runnable Compose variant with canonical filenames. A remote MCP server cannot inspect or install software on a user's PC; local checks/install/start/browser actions belong to a harness with local machine tools.
7. The guided local development setup checks Java, Node/pnpm, Docker Engine, and Compose versions from generated project metadata. Container-only startup technically needs Docker; the harness installs all tools required for the requested development workflow before it proceeds.
8. For a fresh local install, set a unique human-enterable admin password in a local ignored env file before initial demo seeding, wait for readiness, then show the login and password and open the generated login URL. Never place the password in the ZIP, source control, remote MCP arguments, or logs.

## Phases

1. Implement the MCP contract, shared project specification, generation tools, and bounded artifact retrieval.
2. Publish onboarding/development guidance and update the consuming orchestrator to accept generic tasks without Notion.
3. Add the local harness bootstrap: extract safely, check/install runtimes, select/verify platform Compose, start Docker, wait for backend/frontend/admin readiness, show local credentials, and open the browser login page.
4. Select and implement the supported generated-app deployment target with explicit lifecycle and ownership controls. This phase is blocked pending product decisions.
5. Install Playwright, run applicable automated checks, and perform the required manual browser walkthrough before proceeding past any view change; complete release wiring and versioning.

Dependencies are detailed in the phase files. Phase 4 is intentionally gated on user/product decisions recorded in `DECISIONS.md`.

## Cross-Phase Risks

- MCP server instructions/resources are not guaranteed to be injected or read by every OpenAI API client; only the consuming host can enforce a pre-extraction gate.
- Anonymous generation is still a public compute and storage surface. Input allowlists, origin validation, rate/concurrency/size/time limits, retention, and sanitized failures are required without adding authentication.
- Deployment tools add external side effects, credentials, cloud cost, and ownership questions. Do not make public deployment live until the target decision and abuse controls are accepted.
- An archive link is an external fetch surface. Use a fixed OpenKnit origin, unguessable artifact identifiers, expiry, and no caller-supplied download host.

## Immediate Next Action

Complete Phase 2's canonical guide, MCP resource/HTTP endpoint, accurate generated README/AGENTS, and OpenKnit-local generic-task skill. Phase 1's generation contract is implemented and locally verified; keep its live Responses API check open until the deployment has a public `MCP_PUBLIC_ORIGIN`. Then implement Phase 3's secret-safe local setup/readiness/login handoff. Keep Phase 4 blocked until the deployment provider and ownership/cost model are selected.
