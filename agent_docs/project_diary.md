# Project Diary

## 2026-09-25

- The repository's `agent_docs/` directory was absent even though root `AGENTS.md` requires six canonical project documents. The user explicitly authorized creating them; this initial set records only facts supported by repository instructions and the README.
- The scaffolder currently generates and streams project ZIPs. It does not deploy generated applications; hosting the scaffolder service is a separate workflow.
- BitInvoice MCP's OAuth/API-key and account-scoping layers are domain-specific. For the scaffolder no-auth MCP, reuse its protocol/tool-contract lessons only, and apply anonymous request/resource limits without inventing caller identity.
- MCP initialization instructions and resources improve guidance availability but cannot make arbitrary clients read or follow it. A named harness must inject and present setup before extraction if the sequence must be enforced.
- Generic orchestration task fields already exist in the inspected BitInvoice orchestration paths; no Notion requirement appeared in code. Find the actual Notion-gated prompt/skill/config before changing integration code.
- Keep ZIP generation separate from generated-app deployment. Select provider, ownership, credentials/approval, spend limits, and teardown policy before exposing anonymous deploy actions.
- Platform-specific Compose must be selected from the user's requested target OS, not the remote MCP server's OS. A single selected default Compose stack avoids asking the local harness to choose among incompatible archive variants.
- The project manifest should derive Java from the generated Gradle toolchain and Node/pnpm from explicit generated frontend metadata. Docker images bundle Java/Node for Compose startup, but host SDKs still matter for host-native development.
- Demo admin inserts run once per fresh database. The local harness must set a unique password before first seeding, avoid false credentials for reused volumes, and wait for actual backend/frontend/admin readiness because Compose currently has no healthchecks and Actuator readiness was not verified.
- Current work is planning and project documentation only; no MCP implementation or code verification has occurred.

## 2026-09-25 — Implementation kickoff evidence

- Two independent lanes confirmed the same generator boundaries: the UI sends demo-seed and AI flags that the API ignores; there is no target platform or project manifest; generated Compose output only uses default Linux/macOS files despite Windows sources; artifacts are stored by project name without expiry metadata; and the success modal shows `test123` before startup.
- Playwright 1.55.0 and Chromium are a completed prerequisite, independently checked before view edits. Any changed view still needs a manual Playwright walkthrough before subsequent UI implementation continues.
- A remote MCP can publish instructions and a manifest but cannot install tools or open a browser on the user's machine. That action requires the consuming local harness; the exact consuming harness remains unidentified.

## 2026-09-25 — Phase 01/02 verification and Phase 03 start

- Phase 01 has local tests/build, legacy GET ZIP calls, multi-platform archive checks, and Playwright evidence. P01-T01/T10 live Responses API smoke remains gated on a public service origin.
- Phase 02 created the OpenKnit-only generic-task skill under `.codex/skills/open-knit-generic-task/`, and exposes one guide through MCP initialization/resource, `/api/instructions`, generation output, and generated README/AGENTS. The consuming-harness enforcement and execution fixture remain unavailable because no harness is present in this repo.
- Playwright found a real 1px horizontal overflow at widths 375px and below. It is now an active repair and manual recheck task; loading/API failure/network failure observations already passed.
