# App Scaffolder

Generate a packaged modular app ZIP from this mono-repo by selecting backend/frontend modules.

The scaffolder:

- always includes `_common`
- includes requested modules in `backend/modules/*` and `frontend/modules/*`
- updates generated app metadata/config files
- writes final ZIP files into `scaffolder/output/`

## Prerequisites

- Node.js 20+ (recommended)
- `pnpm`
- existing repo layout:
    - `backend/`
    - `frontend/`
    - `scaffolder/`

## 1. Initial setup

From `scaffolder/`:

```bash
pnpm install
cp .env-template .env
```

`.env` is required by the CLI/server (it defines available modules, aliases, root items, etc.).

## 2. CLI usage (generate ZIP package)

### Basic

From `scaffolder/`:

```bash
pnpm run scaffold -- modules=identity,payment,transaction
```

### With custom app name

```bash
pnpm run scaffold -- modules=identity,payment,transaction name=acme
```

Example you requested:

```bash
pnpm run scaffold -- modules=identity,payment,transaction name=acme
```

### Arguments

- `modules=<csv>` (required)
    - comma-separated module list
    - example: `modules=identity,payment,transaction`
- `name=<appName>` (optional)
    - defaults to `backend` when omitted
    - ZIP file name becomes `<name>.zip`

Notes:

- `--name=acme` is also supported (same as `name=acme`).
- module names are normalized to lowercase.
- aliases are supported from `.env` (`MODULE_ALIASES`), e.g.:
    - `payments -> payment`
    - `transactions -> transaction`
    - `identities -> identity`
    - `wallets -> wallet`

## 3. Output

Generated ZIP is written to:

```text
scaffolder/output/<name>.zip
```

Examples:

- no `name`: `scaffolder/output/backend.zip`
- `name=acme`: `scaffolder/output/acme.zip`

## 4. What gets customized in generated package

### Backend

- selected backend modules are included
- `_common` is always included
- updates:
    - `settings.gradle` module includes
    - `build.gradle` dependencies
    - `docker-compose.yml` service/container/database naming
    - `application.yaml` and `application-test.yaml` (when present)
    - app Java package rename for source/test files
    - generated `.env` from backend `.env-template`

### Frontend

- selected frontend modules are included (filtered by modules existing on disk)
- `_common` is always included
- updates:
    - `package.json` app name
    - `docker-compose.yml`
    - `src/components/admin/AdminLayout.tsx` module configs
    - generated `.env` from frontend `.env-template`

## 5. Run scaffolder API server

From `scaffolder/`:

```bash
pnpm run dev:server
```

Server default:

- `http://127.0.0.1:7070`

Useful endpoints:

- `GET /health`
- `GET /api/modules`
- `GET /api/scaffold?modules=identity,payment,transaction&name=acme&counterName=subscription-access`
- `POST /api/wishlist` with JSON body: `{"email":"user@example.com","systemName":"smart-invoicing"}`
- `POST /mcp` — unauthenticated MCP Streamable HTTP endpoint for project generation and setup guidance
- `GET /mcp/artifacts/<token>` — temporary generated ZIP download (expires after 30 minutes)

### MCP project generation

Connect an MCP client to `https://open-knit.com/mcp` (or `http://127.0.0.1:7070/mcp` for local development). The server uses unauthenticated Streamable HTTP. The public UI server forwards `/mcp` requests to the scaffolder API. Configure `MCP_PUBLIC_ORIGIN` when a proxy or deployment hostname differs from the request hostname so generated download links point to the public scaffolder URL. OpenAI's [MCP server guide](https://developers.openai.com/api/docs/guides/tools-connectors-mcp) supports Streamable HTTP for remote servers; remote servers must be reachable by the OpenAI API, or connected through Secure MCP Tunnel when kept private.

Available tools:

- `list_project_modules` returns the selectable source modules and configured aliases.
- `generate_project` creates a ZIP from the repository source files and returns a temporary download URL.
- `get_project_setup_requirements` detects the Java toolchain, Node.js requirement, and pnpm version from the source project and distinguishes container development from native host development.

The `guide_project_setup` prompt gives MCP clients that support prompts a step-by-step installation workflow. The same assistant guidance is included in the setup-requirements tool result for clients that only load tools. The MCP server cannot inspect the user's machine; the connected assistant must run the checks through its own terminal capability or ask the user to run them. The guidance tells the assistant to ask before installing software or starting commands.

Optional MCP settings:

- `MCP_PUBLIC_ORIGIN` — public origin used in ZIP download links; defaults to `https://open-knit.com`. For local development, set it to `http://127.0.0.1:7070` in `.env`.
- `MCP_ALLOWED_ORIGINS` — comma-separated browser origins allowed to call MCP; requests without an `Origin` header are accepted for native MCP clients.
- `MCP_RATE_LIMIT_MAX` and `MCP_RATE_LIMIT_WINDOW_MS` — optional IP-based limit for the MCP endpoint. It is disabled by default because hosted MCP clients may share egress IPs. Set `MCP_RATE_LIMIT_MAX` to a positive number to enable it; the window defaults to the API scaffold window.

Database commands (Drizzle):

- `pnpm run db:push` (apply current schema to PostgreSQL)
- `pnpm run db:generate` (generate SQL migrations)

Note:

- On server startup, schema bootstrap runs automatically (`CREATE TABLE/INDEX IF NOT EXISTS`) using `DATABASE_URL`.

## 6. Run UI (development)

From `scaffolder/`:

```bash
pnpm run dev:ui
```

Or run API + UI together:

```bash
pnpm run dev:all
```

UI expects scaffolder API at:

- `http://127.0.0.1:7070` (default)

## 7. Production build/start

From `scaffolder/`:

```bash
pnpm run build
pnpm run build:ui
pnpm run start:all
```

Alternative starts:

- backend API only: `pnpm run start:server`
- CLI from built files: `pnpm run start`

## 8. Environment variables

Configured in `scaffolder/.env`:

- `AVAILABLE_MODULES`
- `MODULE_ALIASES`
- `BACKEND_ROOT_ITEMS`
- `FRONTEND_ROOT_ITEMS`
- `REPO_ROOT_ITEMS`
- `SCAFFOLDER_QUIET_LOGS`
- `CORS_ORIGIN`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_WINDOW_MS`
- `DATABASE_URL`

Server/runtime overrides:

- `PORT` (API server, default `7070`)
- `SCAFFOLDER_PORT` (launcher backend port)
- `UI_PORT` (launcher UI port)
- `SCAFFOLDER_API_URL` (UI-to-API URL in launcher mode)
