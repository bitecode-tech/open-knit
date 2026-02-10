# Module `AGENTS.md` Format Standard

This file defines the repeatable format and maintenance rules for module-level `AGENTS.md` files under:

- `backend/modules/<module>/AGENTS.md`

Use this as the source template when creating a new module file or updating an existing one.

## 1. Purpose

A module `AGENTS.md` must allow an engineer/agent to understand the module without reading code first:

- what the module does
- domain boundaries and owned entities
- core flows and important decisions
- public API surface and integrations
- class/type map with brief responsibilities

## 2. Mandatory Sections (order is required)

Each module `AGENTS.md` must include sections in this exact order:

1. `## <Module Name> Module`
2. `### What this module is`
3. `### Domain scope`
4. `### Core flows`
5. `### Data ownership`
6. `### Public API surface`
7. `### Integrations and dependencies`
8. `### Class and Type Catalog`
9. `### Configuration`
10. `### Testing notes`
11. `### Change log expectations`

If a section is not applicable, keep it and explicitly write `Not applicable` with one short reason.

## 3. Writing Rules

- Be specific and concrete. Avoid generic text.
- Prefer module language, not framework-only language.
- Use explicit names:
    - schema names
    - table/entity names
    - event names
    - controller paths
    - service/facade interfaces
- Keep descriptions short: 1-2 lines per item.
- Do not include implementation details that change frequently unless they are domain-relevant.
- If module has no flows (example: `_common`), state that explicitly in `Core flows`.

## 4. Update Policy (required on each relevant change)

When any of the following changes, the module `AGENTS.md` must be updated in the same PR/commit:

- new core flow added/removed/changed
- domain model change (new entity/value object/subdomain, removed entity, renamed concepts)
- controller/API contract change
- integration/event contract change
- module boundary change (new dependency, removed dependency, communication pattern change)
- new major class group introduced (for example new `handler/` responsibilities)

No module extension is complete without this documentation update.

## 5. Class Catalog Rules

`### Class and Type Catalog` is mandatory and should be grouped by package areas, for example:

- `config`
- `controller`
- `service`
- `handler`
- `repository`
- `model/entity`
- `model/dto` or `model/command`
- `events`
- `shared` contracts
- `utils`

For each class/type:

- include exact class/type name
- include brief responsibility (1 line)
- include important role in flows if relevant

Format example:

- `PaymentService`: creates payments, validates transitions, publishes payment events.

## 6. Core Flows Format

List flows as numbered sequences with trigger, main steps, and outputs:

1. `Flow name`
    - Trigger:
    - Steps:
    - Output:
    - Failure/edge cases:

Only include business-relevant flows. Technical-only startup flows can be omitted unless essential.

## 7. Domain Scope Format

Must include:

- owned subdomains/capabilities
- owned entities/value objects
- explicitly non-owned areas
- module boundary rules (what can be called directly, what goes through events/facades)

## 8. Public API Surface Format

Document externally visible entry points:

- REST controllers and base paths
- consumed commands/events
- emitted commands/events
- exposed facades/interfaces for other modules

If unavailable, write `Not applicable`.

## 9. Configuration Format

List only module-relevant config:

- properties/env variables used by module
- profile-specific behavior (if any)
- migration schema/location

## 10. Testing Notes Format

Include:

- main test classes or test groups
- critical scenarios that should stay covered
- special setup (containers, demo inserts, async behavior)

## 11. Copy/Paste Template

Use this template for each `backend/modules/<module>/AGENTS.md`:

```md
## <Module Name> Module

### What this module is

<1 short paragraph>

### Domain scope

- Owned capabilities:
- Owned entities/value objects:
- Non-owned areas:
- Boundary rules:

### Core flows

1. <Flow 1 name>
    - Trigger:
    - Steps:
    - Output:
    - Failure/edge cases:
2. <Flow 2 name>
    - Trigger:
    - Steps:
    - Output:
    - Failure/edge cases:

### Data ownership

- Schema(s):
- Main tables/entities:
- Audit/event tables:

### Public API surface

- Controllers/routes:
- Consumed events/commands:
- Emitted events/commands:
- Exposed facades/interfaces:

### Integrations and dependencies

- Internal module dependencies:
- External integrations:
- Communication style (event-driven or direct facade):

### Class and Type Catalog

#### config

- `<ClassName>`: <brief responsibility>

#### controller

- `<ClassName>`: <brief responsibility>

#### service

- `<ClassName>`: <brief responsibility>

#### handler

- `<ClassName>`: <brief responsibility>

#### repository

- `<ClassName>`: <brief responsibility>

#### model/entity

- `<ClassName>`: <brief responsibility>

#### model/dto|command|event

- `<ClassName>`: <brief responsibility>

#### shared contracts (if any)

- `<ClassName>`: <brief responsibility>

#### utils (if any)

- `<ClassName>`: <brief responsibility>

### Configuration

- `<PROPERTY_NAME>`: <meaning/impact>

### Testing notes

- Main test classes:
- Must-cover scenarios:
- Special setup:

### Change log expectations

- Update this file whenever flows/domain/API/integrations/boundaries/classes materially change.
- Treat this update as required for module development.
```

## 12. Minimal Review Checklist

Before finalizing a module change, verify:

- [ ] `AGENTS.md` exists in module root.
- [ ] Mandatory sections exist and are in required order.
- [ ] Core flows reflect current behavior.
- [ ] Domain entities/subdomains are current.
- [ ] Public API and integration contracts are current.
- [ ] Class catalog includes newly added/removed major classes.
- [ ] No stale/contradictory statements remain.
