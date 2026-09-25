# Project Structure

- `backend/`: Spring Boot multi-module application. Module ownership, database, security, and verification rules are in `backend/AGENTS.md` and each module's own `AGENTS.md`.
- `frontend/`: React application. Feature modules live under `frontend/modules/`, shared code under `frontend/modules/_common/`, and app shell code under `frontend/src/`.
- `scaffolder/`: project scaffolder. UI source is under `scaffolder/ui/`; its local instructions are in `scaffolder/ui/AGENTS.md`.
- `docs/`: repository documentation and assets.
- `agent_docs/`: durable project context, progress, and handoff documents.
- `plans/`: resumable multi-phase implementation plans, decisions, and progress logs when work spans sessions or subsystems.
- `plans/scaffolder-mcp-openai/`: active phased plan, decisions, and progress log for the unauthenticated OpenAI-compatible scaffolder MCP.

Keep feature ownership at module boundaries. Confirm exact file paths and existing generation/deployment interfaces during code discovery rather than assuming the README describes the implementation.
