# Project Overview

OpenKnit is a modular platform for bootstrapping full-stack systems. The repository contains a Spring Boot/Gradle backend, a React/Vite/TypeScript frontend, and a separate scaffolder.

## Architecture and workflow

- Backend modules live under `backend/modules/`; they use PostgreSQL schemas and Flyway migrations, with the exact rules in `backend/AGENTS.md`.
- Frontend modules live under `frontend/modules/`; they own their UI, clients, services, and types, with shared code in `_common`.
- Backend and frontend feature modules communicate through module-owned HTTP APIs and clients.
- The scaffolder is a separate project under `scaffolder/`; its UI guidance is in `scaffolder/ui/AGENTS.md`.
- Root `AGENTS.md`, backend/frontend guidance, and scoped module `AGENTS.md` files are authoritative for implementation conventions.

## Current goal

Plan an unauthenticated, OpenAI-compatible MCP interface for the scaffolder that can compose a customized project variation, generate a ZIP, and guide local setup/login; keep cloud deployment as a separately gated capability. The plan includes explicit OS selection, prerequisite checks/install through a local harness, one selected Compose stack, generated admin login/browser opening, MCP onboarding resources, generic-task orchestrator guidance, and Playwright manual view checks.

See `project_progress.md` and [the scaffolder MCP plan](../plans/scaffolder-mcp-openai/00-overview.md) for the active work.
