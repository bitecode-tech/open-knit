# Phase 01: MCP Contract and Project Generation

Status: blocked

## Goal

Expose a no-auth MCP interface that lets an OpenAI-compatible client discover available OpenKnit options, validate a requested variation, and obtain a generated artifact from the existing scaffolder.

## Scope

- TypeScript MCP server integrated with the existing Express service and remote Streamable HTTP endpoint, initially `/mcp`.
- Closed `projectSpec` shared by the existing REST API, UI, and MCP, including a required `targetPlatform` of `windows`, `linux`, or `macos`.
- Catalog, validation, generation, and artifact retrieval contracts.
- No external generated-app deployment in this phase.

## Dependencies

- Decisions recorded before implementation: supported OpenAI surfaces/protocol revisions; supported option set; artifact retention and limits.
- Confirm whether MCP runs in the existing Express process or a separate service. Default: same process, separate route and MCP adapter around the existing generator.
- Before changing a UI view or interaction, complete Phase 05 tasks 1–2 (Playwright and browser installation); manually exercise the affected flow using Phase 05 task 5 before proceeding with subsequent implementation.

## Tasks

 [!] P01-T01. Choose a maintained TypeScript MCP SDK/version compatible with the pinned protocol revision and existing Node/Express deployment. Verify Streamable HTTP and no-auth interoperability against every selected OpenAI surface; include ChatGPT Developer Mode only if the Phase 1 client matrix selects it. **Partially verified:** local Streamable HTTP negotiation succeeded with MCP SDK `1.30.1` and protocol `2025-11-25`; OpenAI documents remote Streamable HTTP. A public-origin Responses API call is blocked because no deployment URL exists.
 [x] P01-T02. Define a versioned closed-schema `projectSpec` with allowlisted module/template IDs, project name, required `targetPlatform` (`windows`, `linux`, or `macos`), and only generator-supported options. The browser form should suggest the OS from browser platform metadata but require visible confirmation; MCP callers must pass it explicitly because MCP generation may be remote from the user's computer. Explicitly reconcile the UI's current `demoInsertsEnabled` and `aiEnabled` flags; either wire them end-to-end or omit them until supported. Reject unknown properties and invalid combinations with field-addressable errors.
 [x] P01-T03. Add MCP tools:
   - `list_project_options`: IDs, descriptions, dependencies, defaults, and supported constraints.
   - `validate_project_spec`: normalize and explain validation errors without writing files.
   - `generate_project`: call the existing generator and return generation/artifact IDs, selected spec, checksum, byte size, expiry, onboarding summary, and a fixed-origin retrieval URL.
   - Add `get_generation_status`/`cancel_generation` only if generation becomes long-running; synchronous ZIP generation is the default.
 [x] P01-T04. Keep the existing `/api/scaffold` contract compatible while moving its parsing/validation to the shared project-spec service. Fix option mismatches so API, UI and MCP descriptions agree on generated behavior.
 [x] P01-T05. Update the scaffolder UI metadata form, client, API, run context, and backend/frontend composition services to select a platform-specific Compose template. Generate one coherent Compose stack with the default root name `docker-compose.yml` and matching service-level Compose files; package no competing Windows/Linux alternative filenames. Define Windows versus WSL behavior and a macOS variant from actual runtime differences, not server OS detection. When the local harness platform differs from `targetPlatform`, stop and ask to regenerate/select a supported variant.
 [x] P01-T06. Emit `open-knit-project.json` (or equivalent) into each generated ZIP with schema version, selected OS, Java SDK/toolchain version derived from the generated backend Gradle toolchain, Node version declared by generated frontend metadata, pnpm version from `packageManager`, required Docker/Compose capabilities, service names/ports, start command, readiness probes, login route, seed mode, and whether an admin login is available. Add explicit Node version metadata to the frontend template if absent; do not brittle-parse arbitrary build scripts at runtime.
 [x] P01-T07. Add bounded artifact storage/retrieval with opaque, unguessable IDs, fixed host origin, expiry/cleanup, size caps, and deterministic naming. Avoid an unrestricted or caller-controlled output path/host. Define whether repeated generation requests with the same idempotency key reuse an artifact; reject a key reused with a different normalized spec.
 [x] P01-T08. Return both human-readable text and structured content. Keep ZIP bytes out of an unbounded JSON response; describe download URL safety and expiry in the result.
 [x] P01-T09. Implement no-auth request handling with MCP Streamable HTTP Origin validation, CORS policy, per-IP rate and concurrency limits, request/response size limits, generator timeout, and sanitized errors. These are abuse controls, not user authorization. Do not accept arbitrary repository URLs, shell commands, or scripts.
 [!] P01-T10. Add protocol-level integration coverage for initialize/instructions, tools/list, validation, platform-specific archive contents, generate, retrieval expiry, malformed input, and unauthenticated access. Verify with all documented OpenAI surfaces selected in Phase 1. **Local contract tests and protocol checks passed; the Responses API surface remains unverified until the service has a public origin.**

## Done

- [!] A live OpenAI Responses API client connects to the deployed service without credentials and can discover the tools, validate a real project spec, and retrieve a ZIP. Local MCP protocol negotiation passed; deployment is not available for this check.
- [x] Existing GET API/UI generation behavior remains compatible and the new MCP contract is versioned.
- [x] Anonymous callers cannot select arbitrary paths/URLs/commands; limits and artifact cleanup are exercised by checks.
- [x] Tool docs and output match generated contents and clearly state that ZIP generation does not deploy a running app.
- [x] Each generated archive has exactly one default Compose variant appropriate to `targetPlatform`, plus a versioned manifest whose Java/Node/pnpm requirements match its source files.

## Next

Publish the stable setup/development guide and generic orchestrator instructions in Phase 2.

## Open Questions

- What public base URL will be configured as `MCP_PUBLIC_ORIGIN` for the live Responses API smoke test?
- Which host will expose the public no-auth MCP, and who owns its rate/concurrency/storage limits?

## Changed Files

Expected: `scaffolder/src/server.ts`, new MCP adapter/tool modules under `scaffolder/src/`, the shared project spec/validator, artifact storage/retrieval/configuration, scaffolder package/lockfiles, and focused tests. Confirm ownership from source layout when this phase begins.

### Execution checkpoint — 2026-09-25

- **Status:** P01-T02 through P01-T09 are verified. P01-T01 and P01-T10 remain blocked on a live Responses API check; the local protocol and contract test coverage is complete. The generated project contract is implemented, so Phase 02 can proceed while the external smoke test remains open.
- **Verified integration facts:** API and UI shapes are in `scaffolder/src/server.ts`, `scaffolder/ui/src/pages/index/+Page.tsx`, and `scaffolder/ui/src/clients/HttpClient.ts`; UI sends `demoInsertsEnabled` and `aiEnabled`, while the API ignores them. `ScaffolderRunContext` has no project spec/platform. Generation resolves only the default Compose files; Windows source variants exist but are omitted from generator root allowlists; no macOS variant or manifest exists. ZIPs are written by project name and streamed directly, with no artifact ID, expiry, or cleanup. The success modal currently displays fixed `test123` before startup.
- **Playwright prerequisite:** P05-T01/T02 independently verified before any UI view change: `pnpm run typecheck` passed; Chromium 140.0.7339.16 launched headlessly; pinned dependency/scripts/config and ignored artifact directory verified. Manual browser walkthrough remains required after each affected view change.
- **Changed Files:** MCP server/tools and project specification under `scaffolder/src/mcp/` and `scaffolder/src/projectSpec/`; generator, API, Compose, environment, manifest, and run-context services under `scaffolder/src/`; scaffolder package metadata; UI API client, project/platform controls, validation/success feedback, and Playwright setup; MCP integration tests under `scaffolder/test/`.
- **Verification:** `cd scaffolder && pnpm test` passed (11 tests); `pnpm exec tsc -p tsconfig.json --noEmit` passed; `pnpm build` passed with non-secret config copied from `.env-template`; `cd scaffolder/ui && pnpm run typecheck` and `pnpm run build:ui` passed. Fresh local MCP initialize/tools/validate succeeded. Linux, Windows, and macOS archives returned 200 and used one matching Compose stack; manifests matched Java/Node/pnpm sources. Legacy GET API checks passed for a simple project and a transaction bundle. Independent Playwright 1.55.0 / Chromium 140.0.7339.16 walkthrough passed project selection, required Identity, platform confirmation reset, empty-name validation, and successful ZIP download; screenshots and trace are in gitignored `scaffolder/ui/temp/`. No live Responses API call was made.
- **Next:** carry the verified project spec/artifact contract into Phase 02 and keep P01-T01/T10 blocked until a public MCP origin exists; do not implement external cloud deployment.

## Verification

### Task checks

- Typecheck/build the scaffolder service; unit-test project-spec normalization and validation; integration-test MCP initialize, tool listing/calls, artifact retrieval, limits, and API compatibility.
- Exercise the documented OpenAI connection flow with no auth and capture protocol evidence for each supported target surface.

### Phase gateway

- After phase integration, run the scaffolder's full configured unit/integration checks, typechecks, and build once as the phase gateway. Any view change invokes the mandatory manual Playwright gate in Phase 05 before implementation proceeds.

## Rollback Notes

Keep MCP registration and routes isolated behind explicit server wiring/config. If compatibility fails, disable `/mcp` without reverting the shared API generator. Retain existing `/api/scaffold` behavior until the replacement contract passes compatibility checks.
