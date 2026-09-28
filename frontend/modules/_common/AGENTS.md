# Shared Frontend Components

This is the source of truth for reusable frontend UI in Open Knit. Before adding a feature control, find the closest component below and inspect its implementation and callers. Add broadly reusable primitives here; keep truly feature-specific layout and behavior in the owning module.

## Buttons and controls

- `GenericButton`: `@common/components/blocks/GenericButton.tsx`. Use for feature buttons. It accepts Flowbite `Button` props (including Flowbite's supported `color`, `size`, and `outline` options) and adds the project's pending/success behavior. Prefer its named export: `import {GenericButton} from "@common/components/blocks/GenericButton.tsx";`.
- `GenericLink`: `@common/components/elements/GenericLink.tsx` for navigation styled as a link.
- `GenericSegmentedControl`, `GenericDropdownSelector`, `ActionsDropdown`, and `GenericStateBadge`: `@common/components/blocks/` for their corresponding selection, menu, action, and status patterns.
- `GenericCheckbox`, `GenericFormTextInput`, `GenericFormSelectInput`, `GenericFormTextArea`, `GenericFormToggleSwitch`, and `GenericFormMultiFileInput`: `@common/components/forms/` for standard form controls.

Use a native `<button>` inside a reusable primitive when its interaction is part of that primitive. In feature code, use `GenericButton` unless its behavior or semantics do not fit; explain a necessary exception near the control. Do not import `Button` directly from `flowbite-react` in feature modules.

## Tables

- `GenericTable`: `@common/components/tables/GenericTable.tsx`. Configure feature-specific columns and cell renderers, then pass server-paged data and the pagination state. It owns the shared table layout, pagination, row selection, CSV export, and optional mobile row rendering.
- `useGenericTablePagination` is exported from the same file. Typical setup:

  ```tsx
  import GenericTable, {useGenericTablePagination} from "@common/components/tables/GenericTable.tsx";

  const tablePagination = useGenericTablePagination();
  return <GenericTable columns={columns} data={data} {...tablePagination} />;
  ```

- Use `GenericTablePagination` and the helpers in `@common/components/tables/filters/` and `@common/components/tables/elements/` when a screen needs those pieces outside the full table.
- Build a native table only for non-data-grid content such as rendered Markdown or a compact preview, or for a specialized view that cannot use `GenericTable`. Keep the exception scoped and explain it in code.

## Other common building blocks

- Modals: `GenericModal`, `GenericSideModal`, `GenericContentModal`, `ActionModal`, and `DoubleButtonActionModal` in `@common/components/modals/`.
- Layout and navigation: `ApplicationShell`, `Breadcrumbs`, and `ProtectedRoute` in their corresponding `@common/components/` folders.
- Feedback and display: `GenericTooltip`, `ColoredLabel`, `MarkdownRenderer`, `SpinnerTextLoader`, `SlotAnimatedNumber`, and table currency/clipboard helpers.
- Shared utility and model code lives in `@common/utils/`, `@common/model/`, `@common/hooks/`, and `@common/types/`.

Update this catalog when a generic component is added, renamed, or removed. The lint path exceptions for specialized chat, OCR, and compact dataset preview markup are narrow accommodations for existing controls; do not use them for unrelated UI.
