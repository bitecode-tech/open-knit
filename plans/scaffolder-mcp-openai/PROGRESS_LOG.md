# Progress Log

## 2026-09-25

- **Completed:** Created the missing six canonical `agent_docs/` files as requested; completed their required intake; confirmed both OpenKnit and BitInvoice MCP repositories are indexed; dispatched and compared two independent source-discovery lanes and three independent protocol/solution research lanes; wrote this evidence-based phased plan.
- **Verified:** OpenKnit scaffolder has an Express `/api/scaffold` ZIP endpoint and generator services, no MCP or generated-app deployment operation; BitInvoice MCP uses authenticated Spring AI and Streamable HTTP; inspected orchestration paths already accept generic tasks and had no Notion source dependency; official OpenAI documentation supports Streamable HTTP and lists different instruction/resource behavior across client surfaces.
- **Next:** Resolve the exact consuming orchestrator skill/config that currently requires Notion, selected OpenAI client matrix, project-spec options, artifact limits, and generated-app deployment target/ownership; then execute Phase 1.
- **Blockers:** Phase 3 generated-app deployment is blocked pending provider/ownership/cost/credential decisions. Arbitrary clients cannot be forced to read MCP guidance; the named consuming harness must enforce a pre-extraction gate.
- **Implementation:** None. Planning and project-doc creation only; no tests or deployment operations were run.

## 2026-09-25 — Local setup and first login requirements

- **Completed:** Expanded the plan to require explicit target OS input, one selected default Compose stack, a generated project manifest with source-derived Java/Node/pnpm versions, and a local harness bootstrap phase.
- **Verified:** Existing Compose dev containers provide Java 25 and Node 22/pnpm 10.32.1; host-native work has separate runtime requirements. Current Compose variants are Linux and Windows/WSL, with no macOS variant, and generation does not accept target OS. Fresh demo seed creates `admin@bitecode.tech` with configured `DEMO_INSERTS_USERS_PASSWORD`; demo seed runs once per database. Compose currently has no readiness healthchecks and no confirmed Actuator health endpoint.
- **Next:** Implement the target platform and manifest in Phase 1; create local harness checks/install/readiness/login behavior in Phase 3. Resolve the package channels and a non-secret admin-readiness signal before implementation.
- **Blockers:** The local harness must have host filesystem/terminal/package-manager/Docker/browser capabilities to perform the requested setup; the remote MCP server cannot inspect or install on the user's PC. Cloud generated-app deployment remains blocked under Phase 4 pending provider/ownership/cost policy.
- **Implementation:** None. Plan update only; no source files, installs, tests, Docker commands, or deployment operations were run.

## 2026-09-25 — Implementation started

- **Active phase/task:** Phase 05 prerequisite work, P05-T01 and P05-T02 (install Playwright and Chromium before any view change).
- **Completed:** Re-read the saved plan and applicable scaffolder UI guidance; loaded TypeScript coding/security guidance; confirmed the MCP code-graph connection is temporarily unavailable and will use prior indexed evidence plus worker source inspection.
- **In progress:** A bounded executor owns only the UI package Playwright dependency/config/install and `scaffolder/ui/AGENTS.md`. Two independent Explorers are locating the Notion-gated orchestrator entrypoint and local harness integration point.
- **Next:** Finish Playwright setup and typecheck, then execute Phase 01 in order. Keep UI view edits blocked until Chromium setup passes. Do not touch pre-existing `backend/docker-compose.yml` or `.playwright-mcp/` changes.
- **Cloud deployment:** Phase 04 remains blocked pending provider/ownership/cost decisions; this does not block local generation and first-run setup.

## 2026-09-25 — Playwright gate and Phase 01 implementation

- **Completed and independently verified:** P05-T01, P05-T02, and P05-T04. Playwright 1.55.0 is pinned, Chromium 140.0.7339.16 launches headlessly, `pnpm run typecheck` passes, artifact paths are ignored, and UI guidance requires manual Playwright walkthroughs after view changes. No E2E suite was run and no E2E specs existed at this checkpoint.
- **Completed discovery:** two independent lanes mapped the scaffolder request/generation/ZIP path, Compose variants, generated seed behavior, and project toolchain. They confirmed that UI seed flags are ignored by the API, no `targetPlatform` or manifest exists, generation only rewrites default Compose files, Windows variants are not packaged, and the success modal advertises fixed credentials before app startup.
- **Active:** Phase 01, P01-T01 through P01-T10. The implementation executor owns `scaffolder/` production files; phase checks and artifact inspection are outstanding.
- **Next:** Finish the shared MCP/project spec, platform-specific archive output, manifest, bounded artifacts, and no-auth controls. Continue with Phase 02 guidance and Phase 03 local bootstrap after Phase 01. Phase 04 cloud deployment stays blocked.

## 2026-09-25 — Phase 01 implementation and independent verification

- **Completed locally:** P01-T02 through P01-T09. MCP SDK `1.30.1` exposes Streamable HTTP with protocol `2025-11-25`; no auth is required. The closed project spec requires Identity and target OS, mirrors the UI constraints, and rejects unknown nested fields. MCP tools support options, validation, and generation; bounded artifacts carry opaque IDs, checksum, byte count, fixed-origin URL, expiry, size/concurrency limits, and idempotency. Platform archives use one selected Compose stack and include a source-derived project manifest.
- **Verified:** `cd scaffolder && pnpm test` (11 passed), TypeScript check, build using values from `.env-template`, UI typecheck, and UI production build passed. Independent local MCP checks validated schema/Identity behavior; legacy GET API checks generated valid ZIPs. Linux, Windows, and macOS archives returned 200 and matched Compose/manifest expectations. Manual Playwright 1.55.0 / Chromium 140.0.7339.16 confirmed required Identity, platform confirmation, invalid-name feedback, and successful ZIP download. Evidence is under gitignored `scaffolder/ui/temp/`.
- **Blocked:** P01-T01 and P01-T10 remain open until a live Responses API call can reach a deployment configured with `MCP_PUBLIC_ORIGIN`. OpenAI's documented Streamable HTTP support and local protocol session support the implementation choice, but do not establish live-host interoperability.
- **Next:** Phase 02 guide/resource/generic-task skill. The exact external harness for pre-extraction setup enforcement is not present in this repository; add the OpenKnit-local generic task skill only, without changing other projects.
