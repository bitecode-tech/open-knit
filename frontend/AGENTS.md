---
description: Frontend repo guidance for OpenKnit.
---

# Frontend Agent Guidance

Use the shared frontend skills for general React/TypeScript guidance:
`typescript-coding-standards`, `react-patterns`, `design-system`, and `coding-standards`.

## Repo Structure

- Feature code lives in `modules/<module>/`.
- Shared primitives, utilities, and cross-module UI live in `modules/_common/`.
- App shell code that is not module-specific lives in `src/`.
- Keep module boundaries explicit. Avoid cross-module imports unless the code is clearly shared.
- Every frontend module under `frontend/modules/<module>/` should have its own `AGENTS.md`.

## Stack

- React 19 + TypeScript + Vite
- React Router v6
- Axios for HTTP clients
- Tailwind CSS and existing project UI components
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
- When using Playwright screenshots, save them under a `temp/` directory because it is gitignored.

## Shared UI Policy

- Reuse `_common` primitives first.
- If a control is broadly reusable and does not yet exist in `_common`, add it there instead of creating a feature-local duplicate.
- Keep the reusable component catalog in `frontend/modules/_common/AGENTS.md` current when generic primitives are added, renamed, or removed.
- Prefer project tokens and existing color semantics over ad hoc hard-coded values.
- Main interactive controls should use the project `primary` palette unless the screen already relies on a different semantic color.
- Any clickable element should use `cursor-pointer` unless there is a specific reason not to.

## Preferred Shared Building Blocks

- Components: `GenericButton`, `GenericTable`, `GenericTablePagination`, `GenericModal`, `GenericSideModal`, `ActionModal`, `DoubleButtonActionModal`, `GenericFormTextInput`, `GenericFormSelectInput`, `GenericFormTextArea`, `GenericCheckbox`, `GenericFormToggleSwitch`, `GenericTooltip`, `GenericLink`, `ColoredLabel`, `Breadcrumbs`, `ActionsDropdown`, `GenericDropdownSelector`, `GenericSegmentedControl`, `GenericStateBadge`, `GenericContentModal`, `MarkdownRenderer`, `SpinnerTextLoader`, `SlotAnimatedNumber`, `ApplicationShell`, `ProtectedRoute`
- Table helpers: `GenericTableSearchFilter`, `GenericTableDateFilter`, `GenericTableClearFilters`, `GenericTableMonthFilter`, `GenericTableActionButton`, `GenericTableClipboardCopy`, `GenericTableCurrencyCell`
- Utils: `PaginationUtils`, `DateFormatterUtils`, `MoneyUtils`, `StringUtils`, `EnumUtils`, `CsvUtils`, `TypeUtils`, `RequestPollingUtils`

## Module Rules

- Keep module-specific UI, services, types, hooks, and pages inside the owning module.
- Use `clients/` for HTTP clients and `services/` for module logic.
- Keep shared types in `types/` and reusable components in the appropriate shared module.
- Do not import backend-driven concerns directly from other frontend modules.

## Notes For Changes

- Update the owning module `AGENTS.md` when you change a module’s responsibilities, flows, or reusable surface.
- Keep frontend changes aligned with the backend API shape for the matching module.
- Prefer small, explicit components and clear data flow over extra abstraction.

## Worktree Notes

- If `AGENTS.worktree.md` exists in `frontend/`, treat it as the local override for that worktree and follow the compose details it defines.
