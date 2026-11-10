---
description: Frontend repo guidance for OpenKnit.
---

# Frontend Agent Guidance

Use the shared frontend skills for general React/TypeScript guidance:
`typescript-coding-standards`, `react-patterns`, `design-system`, and `coding-standards`.

## Repo Structure

- Each `modules/<module>/` directory is an ownership boundary. A module can be a single cohesive capability or contain multiple independent capabilities.
- When a module contains independent capabilities, group code by capability before technical role. Keep each capability's UI, state, API clients/adapters, types, validation, and tests together when they belong to that capability. A cohesive single-capability module may organize its files by technical role at its root.
- Add nested packages for meaningful subfeatures or compatibility boundaries. Use business language to name ownership. Do not create a package for every data object or add levels only to make trees uniform.
- Keep domain-owned code with its owner even when several callers use it. Place genuinely shared concepts at the narrowest meaningful scope that owns them. A `common/` package serves generally applicable facilities of its scope; each child need not use every item. Put subset-specific shared behavior in a clearly named shared capability.
- Use technical-role folders such as `components/`, `clients/`, `services/`, `types/`, `hooks/`, and `utils/` inside their owning capability when useful. Avoid module-wide role folders that scatter independent capabilities.
- Shared primitives, utilities, and cross-module UI live in `modules/_common/`. Within a module, shared code belongs to the narrowest owner common to its consumers; shared packages must not depend on the features that consume them.
- Features that interact across an ownership boundary use an intentional public export or contract. Keep app/module composition in a designated composition layer, avoid imports into another feature's internals, and prevent feature dependency cycles.
- Keep matching frontend and backend business ownership aligned while allowing their package depth and technical organization to differ.
- App shell code that is not module-specific lives in `src/`.
- Keep module boundaries explicit. Avoid cross-module imports unless the code is clearly shared.
- Add a module-local `AGENTS.md` only when that module has conventions that are not covered here. Do not create placeholder copies of this guidance.
- The shared component catalog and its local rules live in `modules/_common/AGENTS.md`.

## Stack

- React 19 + TypeScript + Vite
- React Router v6
- Axios for HTTP clients
- Tailwind CSS and existing project UI components
- Tailwind is the required styling approach. Implement styling with Tailwind utility classes and existing project UI components by default.
- Treat standalone `.css` files and inline style objects as last resorts. Use them only when Tailwind cannot reasonably express the required styling, or when the user explicitly requests CSS; keep any exception narrowly scoped and explain why it is needed.
- ESLint and Prettier for code quality

## Run Locally

- Install dependencies with `pnpm i`
- Start dev server with `pnpm dev`
- Typecheck with `pnpm run typecheck`
- Lint with `pnpm lint`
- Build only when explicitly needed with `pnpm build`
- Preview with `pnpm preview`

## Required Checks

- Run `pnpm run typecheck` before finishing any frontend code change.
- Run `pnpm lint` when touching shared UI, hooks, routing, or anything that may affect formatting or hook correctness.
- Do not run `pnpm build` as default verification unless the user explicitly asks for a production build.
- Use Playwright for browser-based inspection or interaction.
- Always run Playwright browser checks in an isolated browser context that is fresh for each run; never attach to or reuse a context, session, or persistent profile from another agent/Codex run or a user's browser.
- When using Playwright screenshots, save them under a `temp/` directory because it is gitignored.

## Shared UI Policy

- Before implementing or styling a button, table, form control, modal, or other common UI pattern, inspect `modules/_common/AGENTS.md` and the listed implementation for a suitable existing component.
- Use the existing `_common` component when it supports the required behavior. Compose or extend it when a broadly reusable behavior is missing; do not rebuild a matching control inside a feature module.
- If no shared component fits, keep genuinely feature-specific behavior local. For low-level controls or specialized markup that must bypass a shared component, add a brief code comment explaining why.
- Follow the frontend ESLint rules that prevent feature modules from importing Flowbite `Button` directly or rebuilding ordinary buttons and tables. Existing path-scoped exceptions are for the documented specialized controls only.
- Keep the reusable component catalog in `frontend/modules/_common/AGENTS.md` current when generic primitives are added, renamed, or removed.
- Prefer project tokens and existing color semantics over ad hoc hard-coded values.
- Main interactive controls should use the project `primary` palette unless the screen already relies on a different semantic color.
- Any clickable element should use `cursor-pointer` unless there is a specific reason not to.

## Preferred Shared Building Blocks

- Components: `GenericButton`, `GenericTable`, `GenericTablePagination`, `GenericModal`, `GenericSideModal`, `ActionModal`, `DoubleButtonActionModal`, `GenericFormTextInput`, `GenericFormSelectInput`, `GenericFormTextArea`, `GenericCheckbox`, `GenericFormToggleSwitch`, `GenericTooltip`, `GenericLink`, `ColoredLabel`, `Breadcrumbs`, `ActionsDropdown`, `GenericDropdownSelector`, `GenericSegmentedControl`, `GenericStateBadge`, `GenericContentModal`, `MarkdownRenderer`, `SpinnerTextLoader`, `SlotAnimatedNumber`, `ApplicationShell`, `ProtectedRoute`
- Table helpers: `GenericTableSearchFilter`, `GenericTableDateFilter`, `GenericTableClearFilters`, `GenericTableMonthFilter`, `GenericTableActionButton`, `GenericTableClipboardCopy`, `GenericTableCurrencyCell`
- Utils: `PaginationUtils`, `DateFormatterUtils`, `MoneyUtils`, `StringUtils`, `EnumUtils`, `CsvUtils`, `TypeUtils`, `RequestPollingUtils`

## Module Rules

- Keep module-specific code inside its owning module and capability.
- Use `clients/` for HTTP clients and `services/` for logic when those folders help organize the owner; do not make them module-wide catchalls for independent capabilities.
- Place generally applicable module types and reusable primitives in the module's shared scope. Keep subset-specific types or components with the shared capability that owns them.
- Do not import feature internals from other frontend modules. Cross-module communication follows the HTTP module boundary; cross-module shared frontend code belongs in `_common`.

## HTTP JSON Naming

- Internal REST request and response properties use camelCase, matching TypeScript models and Java DTOs. Do not transform internal HTTP JSON keys in shared Axios interceptors or module clients.
- Cover client JSON responses with camelCase contract tests; check multipart and binary endpoints by their content type and returned metadata.
- Provider-defined payloads (including Stripe, OpenAI, and Chatkit) may require snake_case. Keep those names local to the provider adapter and do not propagate them to internal REST models.

## Notes For Changes

- Update the owning module `AGENTS.md` when you change a module’s responsibilities, flows, or reusable surface.
- Keep frontend changes aligned with the backend API shape for the matching module.
- Prefer small, explicit components and clear data flow over extra abstraction.

## Worktree Notes

- If `AGENTS.worktree.md` exists in `frontend/`, treat it as the local override for that worktree and follow the compose details it defines.
