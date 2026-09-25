# Core Technology Notes

- Backend: Java 25, Spring Boot, Gradle, PostgreSQL, schema-per-module, and Flyway. See `backend/AGENTS.md` for exact constraints and checks.
- Frontend: React 19, TypeScript, Vite, React Router, Axios, Tailwind, ESLint, and Prettier. See `frontend/AGENTS.md`.
- Scaffolder UI: TypeScript project with a required `pnpm run typecheck`; scoped rules are in `scaffolder/ui/AGENTS.md`.
- Generated projects use Docker Compose for local startup per the root README. A scaffolder plan must verify actual generation and deployment paths before specifying MCP contracts.
- Code discovery should use codebase-memory MCP graph tools first; index the repository if it is not already indexed. Use literal search for documentation, config, and text values.
- The scaffolder MCP plan uses OpenAI-compatible Streamable HTTP as the initial target, with server instructions, an HTTP guide endpoint, MCP resources, and generated-project guidance. MCP clients do not guarantee resource reads; the consuming harness must inject onboarding before extraction if that is a hard gate.
- Current Compose dev images provide Java 25 and Node 22/pnpm 10.32.1 inside containers; host Java/Node are needed for host-native development. The plan requires a generated manifest to derive Java/Node/pnpm versions and a local harness to check/install missing prerequisites, verify Docker daemon readiness, and start the project.
- Generated project creation must take an explicit Windows/Linux/macOS target because MCP generation may be remote. The ZIP should contain one matching Compose stack under the canonical `docker-compose.yml` name, not competing platform variants.
- Fresh demo inserts currently use `admin@bitecode.tech` and `DEMO_INSERTS_USERS_PASSWORD`, run once per database, and require `DEMO_INSERTS_ENABLED=true`. Existing Compose files lack healthchecks; the plan adds readiness checks and a private per-project local password before first startup, then opens the UI login page.
- Browser-facing changes to the scaffolder require Playwright setup and a manual Playwright walkthrough before implementation can be considered complete. The scaffolder UI currently has a typecheck requirement; the MCP plan adds Playwright and updates its local instructions.
