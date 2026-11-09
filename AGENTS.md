# Repository Guidelines

## Agent Communication
- Use simple, clear language.
- Keep replies short and avoid walls of text.
- Prefer short bullet lists when sharing several points.

## Project Structure & Modules
- Root contains two submodules: `backend/` (Spring Boot, Gradle) and `frontend/` (React + Vite + TypeScript).
- Initialize or update submodules: `git submodule update --init --recursive`.
- When developing a feature in a separate workspace, create and use a workspace under the repository-root `.workspaces/` directory.
- Keep frontend and backend modules clearly separated; every feature module must exist in both `backend/` and `frontend/`.
- Modules connect only through their module boundary: the backend exposes a module controller, and the frontend uses a module HTTP client, with corresponding implementations on
  both sides.
- Most work should be done on both sides by default; avoid backend-only or frontend-only changes unless explicitly requested.
- Tests live in `backend/src/test/java` and (if added) `frontend/src` with `*.test.ts(x)`.
- Assets: frontend public files in `frontend/public/`; backend resources in `backend/src/main/resources`.

## Backend Agent (summary)

- Source of truth: `backend/AGENTS.md`
- Stack: **Java 25 + Spring Boot**, Gradle, PostgreSQL.
- Modules: schema-per-module, Flyway migrations, strict module boundaries.
- If module-to-module comms are needed, ask user to choose **event-driven** vs **direct facade**.

## Frontend Agent (summary)

- Source of truth: `frontend/AGENTS.md`
- Stack: **Vite + React + TypeScript**.
- Modules: `frontend/modules/<module>/`, prefer shared `_common` utilities.

## HTTP JSON Naming

- Internal frontend-to-backend JSON request and response property names use camelCase, matching Java DTO properties and TypeScript types.
- Do not add frontend key-case conversion interceptors or snake_case naming strategies for internal HTTP JSON. Keep Spring Jackson naming at `LOWER_CAMEL_CASE`.
- Contract tests should assert camelCase JSON keys at HTTP boundaries for each endpoint that reads or writes JSON. Multipart and binary endpoints should assert their content type and separately verify any JSON metadata they return.
- Preserve provider-defined wire formats (for example Stripe, OpenAI, and Chatkit) at external integration boundaries; isolate those names in provider adapters/DTOs and do not propagate them into internal frontend/backend contracts.

## Backend <-> Frontend Communication

- Each module communicates via **HTTP controllers** on backend and **HTTP clients** on frontend.
- When adding a feature, update **both sides** by default: controller + client + shared DTOs.
- To find corresponding code, link via:
    - backend: module controller route
    - frontend: module HTTP client using that route
- Avoid bypassing module boundaries; no direct cross-module imports.

### Backend Module Template (strict)

- **Module root:** `backend/modules/<module>/`
- **Java package:** `bitecode.modules.<module>/...`
    - `config/` for module config
    - `config/_modules/` for module init/seed/config entry points
    - `model/` for entities/data/types
    - `repository/` for Spring Data repositories
    - `service/` for business logic
    - `handler/` for command/event handlers (if used)
- **Resources:** `src/main/resources/db/migration/<schema>/...`
- **Demo inserts:** `src/main/resources/demo-inserts/`
    - `_common` references live in `_common` module only
    - module-specific demo scripts live at module root (no extra subfolders)

### Frontend Module Template (strict)

- **Module root:** `frontend/modules/<module>/`
- **Structure:** `components/`, `services/`, `clients/`, `types/`, `_scaffolder/` as needed
- **Exports:** barrel files at module root; no cross-module imports except via shared `_common`

### Current Discrepancies (fix as needed)

- **Identity module package:** `bitecode.modules.auth` (module name is `identity`)
- **Missing config/_modules:** `ai`, `wallet`

## Build, Test, and Run
- Backend
  - Build: `cd backend && ./gradlew build`
  - Test: `./gradlew test` (uses JUnit; some tests may start Testcontainers → ensure Docker is running)
  - Run locally: `./gradlew bootRun` (API on `http://localhost:8080`)
  - Infra (optional): `docker compose up app` in `backend/` on Linux, or `docker compose -f docker-compose-windows.yml watch app` on Windows/WSL
- Frontend
  - Install: `cd frontend && pnpm i`
  - Dev server: `pnpm dev` (UI on `http://localhost:3030`)
  - Build: `pnpm build`; Preview: `pnpm preview`
  - Lint: `pnpm lint`

## Coding Style & Naming

- General
  - Use verbose variables. Instead of const pl = patrons.map(p -> p.name); Do const patronNames = patrons.map(patron -> patron.name).
  - always use brackets for IF, even if it is one line IF. Never do something like that if(true) execute(); Do if(true){execute();}
  - Put data classes into separate files
- Backend (Java 25, Spring Boot)
  - 4‑space indent; packages lowercase; classes `PascalCase`, methods/fields `camelCase`.
  - Prefer constructor injection; annotate REST/APIs clearly; use Lombok where already used.
  - MapStruct and QueryDSL are included—follow existing patterns.
  - Try to always use import instead of inlining class namespace, i.e instead of new bitecode.modules.ai.SomeClass(); Do import bitecode.modules.ai.SomeClass; new SomeClass();
- Frontend (TS/React)
  - 2‑space indent; components `PascalCase.tsx`; hooks `useX.ts`.
  - Keep types explicit; run `pnpm lint` before pushing.

## Testing Guidelines
- Backend: JUnit 5 with Spring Test; name test classes `*Tests` or `*IT`. Use Testcontainers for DB‑touching tests. Aim for service and controller coverage; REST Docs snippets are generated by tests.
- Frontend: No runner configured; if adding tests, prefer Vitest + React Testing Library, files `*.test.tsx` colocated with components.

## Commits & Pull Requests
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, with optional scope, e.g., `feat(frontend): add invoices table`.
- Promote production changes by merging `main` into `prod`; cherry-pick only when specifically requested.
- PRs: include concise description, linked issues, API or UI screenshots where relevant, and notes on env/config changes.

## Security & Configuration
- Never commit secrets. Copy `frontend/.env-template` to `frontend/.env` and keep local.
- Stripe and other keys (backend) should be provided via environment or `.env` referenced by `backend/docker-compose.yml`.
- Ports: backend `8080`, frontend `3030`. Adjust CORS/origin configs if changing.

## Agent Notes
- If a directory contains its own `AGENTS.md`, follow it for that scope (e.g., `frontend/AGENTS.md`).
- For frontend implementation or review against a Figma frame, mockup, or UI screenshot, load `.codex/skills/figma-focused-implementation/SKILL.md`. New scaffolded apps include the skill at `.agents/skills/figma-focused-implementation/SKILL.md`; load it alongside an orchestrator when its plan, ticket, or acceptance criteria references Figma or a UI image.
