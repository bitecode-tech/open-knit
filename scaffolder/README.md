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
- `GET /api/scaffold?modules=identity,payment,transaction&name=acme`

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

Server/runtime overrides:

- `PORT` (API server, default `7070`)
- `SCAFFOLDER_PORT` (launcher backend port)
- `UI_PORT` (launcher UI port)
- `SCAFFOLDER_API_URL` (UI-to-API URL in launcher mode)
