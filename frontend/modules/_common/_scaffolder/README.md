# Scaffolder Imports

This folder collects shared scaffolding contracts and patterns used to assemble feature modules into the admin
layout. Module-specific scaffolder configs live under each module’s own `_scaffolder/` directory and
should only depend on the types exported here.

## What belongs here

- Shared config types such as `AdminLayoutModuleConfig`.
- Guidance for how to structure module configs so AdminLayout can auto-wire routes, breadcrumbs, and sidebar items.

## How modules should use this

Each module exports a single config object (e.g., `transactionsAdminLayoutConfig`) that matches
`AdminLayoutModuleConfig`. AdminLayout imports those configs and registers them in a single array.

## Adding a new module

1. Create `frontend/modules/<module>/_scaffolder/<Module>AdminLayoutConfig.tsx`.
2. Export one `AdminLayoutModuleConfig` object with optional fields.
3. Import the config in `frontend/src/components/admin/AdminLayout.tsx` and add it to `adminModuleConfigs`.
