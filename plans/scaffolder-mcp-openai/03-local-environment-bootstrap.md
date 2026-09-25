# Phase 03: Local Environment Bootstrap and First Login

Status: in progress

## Goal

After the user receives and extracts a project ZIP, let the local harness verify its platform and required SDKs, install missing tools, start Docker and the generated application, wait until its seeded admin is usable, show the local login credentials, and open the browser login page.

## Scope

- Host-side actions performed by the user's trusted local harness, not by a remote MCP server.
- Versioned machine-readable generated-project manifest, OS-specific compose selection, package installation, Docker daemon startup, readiness, first-run admin credentials, and browser opening.
- Guided development setup checks JDK, Node/pnpm, Docker Engine, and Compose; container-only app startup uses its pinned Java/Node container images and requires Docker on the host.
- Local development/demo login only. Production admin provisioning must remain secure and separate.

## Dependencies

- Phase 01 emits mandatory `targetPlatform`, one selected Compose stack, and `open-knit-project.json` from validated generator inputs.
- Phase 02 publishes the canonical setup flow and documents that the MCP server cannot inspect/install on the local host.
- The consuming harness must have local filesystem, terminal, package-install, Docker, and browser-open capabilities. If any are unavailable, it stops before claiming setup is complete.
- The selected generated variation must include identity/auth and the local development seed path. Current generator selections lock in identity; preserve a clear no-login result if that changes.

## Tasks

[x] P03-T01. Make project creation capture an explicit target OS: `windows`, `linux`, or `macos`. In the web UI, suggest the browser's platform but require confirmation; in MCP, require the calling harness to pass the platform because the remote MCP server's OS is unrelated to the user's computer. Define WSL handling (recommended: select Windows when Compose runs from Windows/PowerShell, Linux when commands run inside WSL) and reject unsupported/mismatched targets.
[x] P03-T02. Generate exactly one runnable Compose variant in the archive with canonical root name `docker-compose.yml` and matching service Compose files. Keep the platform-specific source template internal to generation; do not ship competing `docker-compose-windows.yml` and Linux/macOS default choices. Ensure the root file references only service files emitted for the same target.
[~] P03-T03. Include a versioned manifest that gives source and normalized value for:
   - [ ] required Java SDK version, read from the generated backend's Gradle Java toolchain/build configuration;
   - [ ] required Node.js version, declared explicitly in generated frontend metadata (`engines.node` or a version file), and pnpm from `packageManager`/Corepack metadata;
   - [ ] Docker Engine and Compose v2 requirements;
   - [ ] target OS, Compose root/child paths, service names, ports, exact start/stop commands, readiness probes, login URL, and whether demo admin seeding is available.
   Do not hardcode Java 25 in the harness when the generated project's backend metadata can be inspected. Add explicit Node metadata where the frontend currently lacks a host version declaration.
[ ] P03-T04. On ZIP receipt, verify checksum and expiry. Extract to a new isolated directory only after the harness has presented the guide. Inspect the archive/manifest and reject absolute paths, traversal entries, symlinks escaping the project root, and unexpected executables before extraction or script execution.
[ ] P03-T05. Detect actual local OS/architecture and compare them with `targetPlatform`. If they differ, stop and offer project regeneration for the current OS; never run a mismatched Compose stack by guessing. Confirm the one included root Compose file is the selected/default file.
[ ] P03-T06. Check `java -version`, frontend Node version, `corepack`/pnpm version, `docker --version`, `docker compose version`, and `docker info`. Compare each installed version to manifest requirements and distinguish missing tools from version conflicts. The guided development workflow verifies JDK, Node/pnpm, Docker and Compose before continuing; the harness may explain that a Docker-only runtime launch does not itself require host Java/Node because those are in the dev containers.
[ ] P03-T07. Install missing or incompatible tools from verified official installers/package channels for Windows, macOS, and the supported Linux distributions. Do not run arbitrary scripts from the generated archive or use unverified download URLs. Request user approval before administrator/elevated installs or machine-level service changes; verify versions again after installation. If permissions, network, unsupported distribution, or user approval prevent installation, stop and provide exact manual steps without starting the project.
[ ] P03-T08. Ensure the Docker daemon is running. Start Docker Desktop/service where supported, wait for `docker info` to succeed, and ask for user action when startup requires an interactive license, elevated privilege, or OS confirmation. Do not treat Docker CLI presence alone as a running engine.
[ ] P03-T09. Before first startup, create/update only a gitignored local env file. For a fresh local-development database, enable the appropriate demo seed and set `DEMO_INSERTS_USERS_PASSWORD` to a unique, human-enterable generated password; do not use the repository's fixed `test123` default for each generated project. Keep the existing seeded username (`admin@bitecode.tech`) only where the selected identity template includes it. Never put the generated password in the ZIP, source control, remote MCP arguments, logs, telemetry, or tool call transcript.
[ ] P03-T10. Reconcile the currently ignored `demoInsertsEnabled` UI option end-to-end. For a first-run local development setup, either ensure demo seeding is enabled before the empty database is initialized, or add a separate safe local-admin provisioning step. For an existing database/volume, detect that demo initialization already ran and do not claim a newly generated password will work or silently reset an account.
[ ] P03-T11. Add deterministic Compose/app readiness checks. Current Compose files have no healthchecks and no confirmed Actuator endpoint, so implement an explicit generated-app readiness probe (or container healthcheck) for PostgreSQL, backend startup, and frontend HTTP availability. Wait until the admin seed has completed and its login is usable before continuing; use bounded polling/timeouts and show actionable startup errors.
[ ] P03-T12. After readiness succeeds, present username, the unique local password, login URL, and the local-only/demo scope in the harness. Then open the user's browser at the generated app login path (currently `http://localhost:3030/login`, derived from the manifest rather than hardcoded). Do not submit credentials or log in automatically; leave the login page ready for the user.
[ ] P03-T13. Hand off to coding after opening the login page: explain that the user signs in manually, then offer the Heavy-route implementation workflow. For substantial code changes, create or update an implementation plan before coding and keep progress and verification evidence current. Use Heavy when the local harness supports it; otherwise use its equivalent planning workflow.
[ ] P03-T14. Record installed versions, checks, selected compose file, readiness outcome, and browser URL without recording the password. If the harness cannot launch a local browser, give the exact URL and pause for the user.

## Done

- Generated artifacts carry an explicit platform and one coherent default Compose stack; Windows/Linux/Unix/macOS and WSL behavior is tested and documented.
- The manifest matches generated backend/frontend source requirements and changes automatically when the configured toolchain versions change.
- The local harness detects missing/outdated JDK, Node/pnpm, Docker/Compose, installs only through supported official channels with needed consent, verifies the daemon, and refuses to run after a failed check.
- Fresh local setup uses a unique, private admin password before one-time demo seeding; reused databases do not display a password that was never applied.
- The harness waits until DB/backend/frontend/admin are ready, presents the admin login and password without leaking it, and opens the login page in the browser.
- After setup, the harness offers a coding handoff that keeps substantial implementation work planned and verified through Heavy route when supported; the user completes login manually.
- Remote MCP responses are clear that local checks/installations happen in the user harness. No successful setup claim is made when the harness lacks local machine access.

## Next

Implement a generated-app provider only after the separate Phase 04 deployment decision is complete, then finish browser/release acceptance in Phase 05.

## Open Questions

- Which Windows package installer, Linux distributions/package sources, and macOS installer channels are supported for unattended or user-approved setup?
- Which exact supported Linux distributions and official package channels should be enabled for unattended or user-approved installation?
- Should the local admin password be generated by the harness, entered by the user, or both? Default: harness-generated, unique, and human-enterable.
- What local signal confirms database demo inserts and the admin account are ready without exposing credentials or adding broad operational endpoints?

## Changed Files

Expected: project-spec types/UI/API and scaffolder run context/services; platform Compose templates/file lists; generated `open-knit-project.json`; explicit Java/Node metadata; Compose and readiness configuration; local setup instructions and harness skill/prompt; local env ignore handling; focused generator/manifest/setup tests. Exact harness files depend on Phase 02 discovery.

## Verification

### Task checks

- Generate and inspect Linux, Windows/WSL, and macOS artifacts: each contains only one selected Compose stack, every referenced file exists, and `docker compose config` succeeds on the target runner.
- Change backend Java toolchain and frontend Node/pnpm metadata in fixtures; confirm manifest values follow them and installation checks reject incompatible local versions.
- Simulate missing SDKs, Docker CLI, Docker daemon, insufficient permissions, unsupported OS, and mismatched target platform. Verify supported installation, version rechecks, bounded failure, and no startup when prerequisites fail.
- Start a clean local stack, confirm DB/backend/frontend readiness and seeded `admin@bitecode.tech`, then verify the generated password works before showing it and open the manifest login URL. Verify reused volumes do not receive a false new password.
- Confirm passwords are absent from ZIPs, Git changes, process logs, telemetry, MCP requests, and browser-launch arguments.

### Phase gateway

- On a clean Windows, Linux, and macOS test host (including the documented WSL mode), run the full harness from ZIP retrieval through prerequisite checks, daemon readiness, app readiness, credential presentation, and browser open. Keep tests on disposable local fixtures and do not deploy cloud resources.

## Rollback Notes

Make setup stages individually resumable and record non-secret stage state locally. If installation or Compose startup fails, stop only services started for this generated project and preserve the archive/workspace. Never remove existing Docker volumes or rotate existing admin credentials automatically during recovery.
