---
name: module-agents-maintenance
description: Use when an Open Knit change materially affects a backend or frontend module and its local AGENTS.md should be updated in the same change.
---

# Module AGENTS Maintenance

Use this skill whenever a change materially affects a backend or frontend module and its local `AGENTS.md` should be updated in the same change.

## Update when

- the module gains or loses a responsibility
- a core flow changes
- an endpoint or reusable client surface changes
- new dependencies or integrations are introduced
- ownership or boundary rules change
- reusable frontend primitives or shared module surface changes

## Backend expectations

For backend module guides, keep these sections accurate:

- what the module is
- domain scope
- core flows
- data ownership
- public API surface
- integrations and dependencies
- class and type catalog
- configuration
- testing notes

## Frontend expectations

For frontend module guides, document the module's owned UI surface, routes, clients, services, shared exports, and notable boundary rules.

## Rule

Do not leave module `AGENTS.md` as follow-up documentation debt. If the code change modifies module behavior in a way another engineer or agent would need to understand later, update the guide in the same change.
