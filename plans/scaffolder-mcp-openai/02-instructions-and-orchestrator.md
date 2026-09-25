# Phase 02: Onboarding Guidance and Generic Orchestration

Status: in progress

## Goal

Make accurate project composition, extraction, startup, and development guidance available at MCP connection time and inside every generated project. Make the LLM orchestrator accept an ordinary task without a Notion connector or page.

## Scope

- MCP `serverInfo.instructions`, a stable HTTP endpoint, and MCP resource(s) backed by one canonical versioned guide.
- Concise tool descriptions and generation results that repeat relevant prerequisites/actions.
- Root project guidance and optional custom skill material included in generated ZIPs.
- Consuming orchestrator prompt/skill/config changes; do not change unrelated Notion integrations.
- A machine-readable generated-project manifest carrying exact local setup requirements from project source configuration.
- No local machine package installation in the remote MCP server; installation belongs to the consuming local harness.

## Dependencies

- Phase 1 project spec and generated artifact contract.
- Before this phase, identify which orchestrator prompt/skill/config currently requires Notion and which harness can enforce setup-before-extraction.
- Complete Phase 05 tasks 1–2 before changing a UI view or interaction; manually exercise the affected flow using Phase 05 task 5 before proceeding with subsequent implementation.
- Validate the generated project recipes against the exact template composition before declaring versions/prerequisites.

## Tasks

 [x] P02-T01. Author a versioned canonical guide exposed as:
   - MCP initialization instructions, with the first ~512 characters self-contained: use supported project options, validate before generation, inspect setup instructions before extraction, and do not claim generation equals deployment.
   - MCP resource(s), such as `openknit://scaffolder/onboarding` and `openknit://scaffolder/development`.
   - Stable REST endpoint (recommended `GET /api/instructions`) returning Markdown or versioned JSON with content type, version, and last-modified/hash metadata.
 [!] P02-T02. State explicitly that protocol availability is not enforcement. For a mandatory setup-before-extraction workflow, update the consuming OpenAI/Codex harness to inject server instructions and fetch/present the onboarding guide before it offers archive extraction or command execution. A client that ignores instructions cannot be forced by the MCP server to obey them. (Blocked locally: no consuming harness is present to verify the required behavior.)
 [x] P02-T03. Include a generated root `README.md` and `AGENTS.md` with the exact variation's modules, supported commands, boundaries, prerequisites, ports, environment template/secret handling, and links to module-owned guidance. Do not simply copy every source module's AGENTS content into the ZIP.
 [x] P02-T04. Include a user sequence before development:
   - Download and verify artifact checksum/expiry; extract into a new, empty directory and inspect `open-knit-project.json` and the root before running scripts.
   - Check Java SDK version from the generated backend Gradle toolchain settings; check Node from explicit generated frontend version metadata and pnpm from its `packageManager` value. Check Docker Engine and Compose v2, including whether the daemon is running.
   - Install missing/mismatched JDK, Node/pnpm, and Docker tools using verified official platform installers before starting the guided development workflow. Explain that Compose containers already provide Java/Node for container startup; host JDK/Node are needed for host-native development and tooling.
   - Configure environment values from `.env-template`; create local-only secrets; never commit credentials. Store the per-project local admin password only in an ignored local env file.
   - Start using the generated README's exact platform-selected `docker compose up` command; wait for backend, database, frontend, and admin seed readiness before opening the login page.
   - Read generated `AGENTS.md` and relevant module instructions before changing code; run the scoped backend/frontend checks afterward.
   - After the login page is open and credentials are presented, explain that the user signs in manually, then offer the Heavy-route coding handoff. For substantial implementation work, create or update a task plan before coding and keep its progress and verification evidence current. Use Heavy only when the local harness provides that workflow; otherwise follow the host's equivalent planning workflow.
 [x] P02-T05. Define a reusable development skill only where it provides a distinct multi-step workflow (for example, adding a module-aligned full-stack feature). Prefer portable generated `AGENTS.md` first. If including a Codex skill, verify current repository skill packaging convention and include it under the supported `.agents/skills/<skill-name>/SKILL.md` or host-specific location with explicit description/triggers; do not label arbitrary ZIP documentation as automatically installed OpenAI API Skills.
 [x] P02-T06. Define the orchestrator's required task envelope as generic fields: objective/title, context, acceptance criteria, constraints, dependencies, required setup, and verification. Notion may enrich context when connected but is optional and must not block task creation, planning, or execution.
 [!] P02-T07. Ensure an ordinary task supplied through the consuming harness can enter the same generic orchestration path as a task with optional Notion context. Do not add a new Notion schema or require Notion IDs. Include an offline test/fixture where no Notion client is present. (Blocked locally: no consuming harness is present to verify the required behavior.)
 [x] P02-T08. Return the canonical instructions and manifest version in `generate_project` structured output so an LLM harness can present prerequisites before downloading/extracting. Keep tool descriptions/action labels explicit to reduce mistaken destructive or deployment actions.
 [x] P02-T09. Document the host boundary: remote MCP returns project-specific requirements and commands; only a trusted local harness can inspect the user's machine, download/install tools, start Docker, and open a browser. If it lacks local machine access, it must stop at instructions and ask the user to provide that capability rather than claiming setup is complete.
 [x] P02-T10. Add or update an OpenKnit-local skill under the verified `.codex/skills/` convention that accepts generic development tasks, creates/updates an implementation plan for substantial work, and uses Notion only as optional context. Do not change global skills or skills in other projects.

## Done

- Implemented one versioned guide used by MCP initialization, the onboarding MCP resource, GET /api/instructions, and structured generate_project output. The guide includes a SHA-256 hash, last-modified value, and a safe first-run summary.
- Generated root README.md and AGENTS.md from the selected project spec and generated manifest; the guidance includes the selected modules, platform command, tool versions, published ports, environment/credential handling, boundaries, and selected backend module guide links.
- Added the OpenKnit-local open-knit-generic-task skill with the generic task envelope, optional Notion context, and substantial-work planning guidance.
- Verified local protocol and archive behavior. No consuming harness or pre-extraction enforcement was verified; P02-T02 and the consuming-path portion of P02-T07 remain blocked.

## Next

Continue Phase 03 local bootstrap work in parallel. Close Phase 02 only after a named consuming harness is available and its pre-extraction guidance gate and generic task path are verified.

## Open Questions

- Which named consuming harness should own the pre-extraction gate and generic task path acceptance? Neither consumer is present in this repository.

## Changed Files

- Canonical guide and protocol/API surfaces: scaffolder/src/guidance/instructions.ts, scaffolder/src/mcp/projectTools.ts, and scaffolder/src/mcp/router.ts.
- Variation-specific ZIP docs: scaffolder/src/services/GeneratedProjectGuidance.ts and scaffolder/src/services/AppScaffolderService.ts.
- Coverage: scaffolder/test/GeneratedProjectGuidance.test.ts and scaffolder/test/McpProtocol.integration.test.ts.
- Local task workflow: .codex/skills/open-knit-generic-task/SKILL.md.
- Status and verification evidence: this Phase 02 plan.

### Implementation checkpoint — 2026-09-25

- **Status:** P02-T01, T03-T06, and T08-T10 are implemented and locally verified. P02-T02 and the consuming-harness portion of P02-T07 are blocked because no named consuming harness exists in this repository.
- **Verified:** MCP initialization, resource listing/reading, GET /api/instructions, and generate_project structured output share guide version/hash/content. A generated Windows identity-only ZIP contains variation-specific README.md and AGENTS.md; module, command, port, toolchain, module-guide links, and credential guidance reflect the generated composition. Stale root docs, README-run commands, and test123 are absent from the generated guidance.
- **Constraint:** protocol instructions, resources, and a local skill guide clients but cannot enforce client behavior. The skill is OpenKnit-local; global skills and other projects were not changed. Phase 03 owns generated local password provisioning.
- **Next:** identify the consuming harness before claiming or testing setup-before-extraction enforcement or offline generic-task execution through that harness.

## Verification

### Task checks

- cd scaffolder && pnpm test — 13 tests passed, including P01 protocol tests and new guide/resource/REST/generation and variation-specific guidance coverage.
- cd scaffolder && pnpm exec tsc -p tsconfig.json --noEmit — passed.
- cd scaffolder && set -a; . ./.env-template; set +a; pnpm build — passed using non-secret template configuration; this also rebuilt the generation cache.
- Generated a real Windows identity-only archive and inspected its README.md, AGENTS.md, manifest, selected guidance links, platform command, and absence of stale root text/fixed credentials.
- python3 /home/hubert/.codex/skills/.system/skill-creator/scripts/quick_validate.py .codex/skills/open-knit-generic-task — valid.

### Phase gateway

No scaffold UI view or interaction changed. The Phase 05 Playwright gateway was not in scope. No live Responses API interoperability check or consuming-harness acceptance check was performed; those require a public origin and a named local consumer, respectively.

## Rollback Notes

Keep generated instructions versioned and separable from code generation. If a host cannot inject instructions, retain the readable endpoint/resource and disable any workflow claim that setup was enforced; do not silently permit a no-op acknowledgment to stand in for a host gate.
