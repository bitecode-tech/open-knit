# Decisions

## 2026-09-25 — Reuse the TypeScript scaffolder and keep the initial MCP no-auth

- **Decision:** Implement the planned MCP adapter in the existing TypeScript/Express scaffolder and do not copy BitInvoice's OAuth/API-key/account authorization layers.
- **Reason:** The scaffolder is already TypeScript/Express and owns the project generator; the user requested no authorization. BitInvoice's identity and account isolation are specific to invoice data.
- **Impact:** Anonymous resource controls are required (Origin checks, allowlists, rate/concurrency and size/time limits, bounded artifact retention). This does not make arbitrary external deployment safe by itself.

## 2026-09-25 — Use Streamable HTTP as the initial OpenAI transport target

- **Decision:** Plan one HTTPS MCP endpoint using Streamable HTTP and pin a concrete protocol revision proven compatible with the selected clients. Add HTTP/SSE or ChatGPT Developer Mode only if the Phase 1 client matrix requires and verifies them.
- **Reason:** The [OpenAI Responses API MCP guide](https://developers.openai.com/api/docs/guides/tools-connectors-mcp) documents remote MCP over Streamable HTTP or HTTP/SSE. Client support for initialization instructions and resources must be verified per target.
- **Impact:** Verify each selected client before release; do not assume instructions are injected into every client.

## 2026-09-25 — Provide startup guidance through multiple channels

- **Decision:** Use MCP initialization instructions, a stable HTTP instructions route, MCP resources, tool descriptions/results, and generated README/AGENTS files from a versioned guide.
- **Reason:** MCP resources are client-driven, and arbitrary clients can ignore instructions. A consuming harness can enforce the setup-before-extraction gate only by injecting/presenting the guide itself.
- **Impact:** The product promise must distinguish content availability from client enforcement. The host's manual/automated acceptance must prove instructions enter context before extraction/commands.

## 2026-09-25 — Keep app deployment separate and gate it on target selection

- **Decision:** Do not equate ZIP generation or deploying the scaffolder service with deploying a generated app. Define `deploy_project` as a separate future tool after provider, owner, credentials, approval, quotas, cost, and cleanup are decided.
- **Reason:** Current scaffolder code generates/downloads ZIPs only; there is no selected app deployment provider or ownership model. Anonymous deployment could create billable resources and external side effects.
- **Impact:** The plan includes a generated-app deployment phase marked blocked. Until Phase 4's decision is recorded, V1's cloud delivery is a generated artifact plus verified local Compose/start guidance.

## 2026-09-25 — Orchestrator tasks are generic; Notion is optional context

- **Decision:** Define required task fields independently of Notion; accept generic task goal/context/acceptance/constraints/verification. Notion can be used as optional enrichment.
- **Reason:** Repository discovery found generic task models and dispatch already present, and no Notion code requirement in inspected orchestration integration paths. The suspected hard requirement is likely in a consumer prompt/skill/config and must be located before edits.
- **Impact:** Phase 2 locates and updates that consumer entrypoint and proves task flow with Notion disconnected.

## 2026-09-25 — Require installed Playwright and manual view acceptance

- **Decision:** Add Playwright/browser setup to the scaffolder UI and require manual Playwright browser checks whenever a view/interaction changes.
- **Reason:** User explicitly set this as an implementation gate. Current scaffolder package metadata has no Playwright dependency/script/config.
- **Impact:** `scaffolder/ui/AGENTS.md` and implementation acceptance must carry the rule; typecheck or headless automation alone is insufficient after view changes.

## 2026-09-25 — Keep generic task intake OpenKnit-local

- **Decision:** Remove any Notion prerequisite only from the skill installed with OpenKnit under its project-local `.codex/skills/` convention. Treat Notion as optional context. Do not modify global Codex skills or orchestration skills in other projects such as BitInvoice.
- **Reason:** The user specified that the change should apply only to the OpenKnit skill; discovery found BitInvoice already accepts generic tasks and no existing OpenKnit orchestrator skill was present.
- **Impact:** Phase 02 adds P02-T10 to author or update the OpenKnit-local generic-task skill and validate its local packaging convention.

## 2026-09-25 — Defer live OpenAI MCP verification until deployment

- **Decision:** V1 targets the OpenAI Responses API remote MCP integration over Streamable HTTP, using MCP SDK `1.30.1` and protocol revision `2025-11-25`. Developer Mode is not included in the initial client matrix. Local MCP protocol and contract tests provide implementation evidence, but do not substitute for the plan's selected-surface interoperability test.
- **Reason:** The local MCP test client negotiated the selected revision, read server instructions, listed tools, and validated a project specification without authorization. The OpenAI remote MCP guide documents Streamable HTTP. A live Responses API call cannot be performed until the MCP is publicly reachable at the configured fixed origin.
- **Impact:** Keep P01-T01/P01-T10 blocked and do not claim a live OpenAI connection has been tested. Run the Responses API smoke test as a release gate after hosting supplies `MCP_PUBLIC_ORIGIN`.

## 2026-09-25 — Require an explicit project host platform and one default Compose stack

- **Decision:** Add `targetPlatform` (`windows`, `linux`, or `macos`) to the UI/API/MCP project specification. Generate one matching Compose stack using the canonical `docker-compose.yml` root name and matching child files; do not include competing platform variants in the ZIP.
- **Reason:** Scaffolder generation may run remotely, so server OS cannot identify the user's machine. Existing files have Linux and Windows/WSL variations but no macOS variant, and the generator currently packages the Linux-named files only.
- **Impact:** Browser UI suggests and confirms platform; MCP clients supply it. Define WSL behavior, create/test macOS composition, and have the local harness reject a target/host mismatch.

## 2026-09-25 — Derive local tool requirements from generated project metadata

- **Decision:** Include Java SDK, Node, pnpm, Docker, and Compose requirements in a machine-readable project manifest, sourced from generated backend toolchain configuration and explicit frontend version metadata. The local harness detects and installs missing tools before the requested development setup; it checks the Docker daemon separately from Docker CLI presence.
- **Reason:** Current backend toolchain is Java 25; dev containers carry Java 25 and Node 22/pnpm 10.32.1, while frontend has no explicit host Node pin. A remote MCP cannot inspect/install on the local machine.
- **Impact:** The guided local development workflow checks/installs all requested tools before first startup, while explaining that host JDK/Node are bundled in Compose containers and are technically needed only for host-native commands. Ask before elevated installs, verify versions, and stop on failure.

## 2026-09-25 — Provision local admin credentials before first boot and open login after readiness

- **Decision:** For a fresh local database, the harness sets a unique human-enterable admin password in an ignored local env file before demo seeding, waits for DB/backend/frontend/admin readiness, then presents the login and password and opens the manifest login URL. Existing databases must not be told a newly generated password was applied.
- **Reason:** Fresh demo inserts currently create `admin@bitecode.tech` using `DEMO_INSERTS_USERS_PASSWORD` when demo inserts are enabled; seeding runs once per database. Current Compose files have no readiness healthchecks, and no Actuator endpoint was verified.
- **Impact:** Reconcile the UI's ignored demo-inserts option end-to-end, add a reliable readiness signal, and keep local demo login separate from production provisioning. Never put passwords in ZIPs, source control, remote MCP calls, or logs.
