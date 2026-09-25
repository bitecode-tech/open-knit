---
name: open-knit-generic-task
description: Turn an ordinary OpenKnit development request into a scoped, verifiable implementation task with a maintained plan for substantial work; Notion is optional context.
---

# OpenKnit generic development task

Use this skill for development work in OpenKnit, whether the request arrives directly or with optional Notion context. Notion is never a prerequisite for task intake, planning, or implementation.

## Capture the task

Represent the request with the information available:

- **Objective/title:** the outcome the user wants.
- **Context:** relevant product, codebase, and prior-decision context.
- **Acceptance criteria:** observable conditions that define completion.
- **Constraints:** scope, compatibility, safety, and user preferences.
- **Dependencies:** services, decisions, APIs, or other work the task needs.
- **Required setup:** environment or access needed before implementation.
- **Verification:** proportionate checks and evidence that will demonstrate the criteria.

Ask only for missing details that materially change the solution and cannot be inferred safely. Keep going on independent parts while awaiting such details.

## Plan and implement

For substantial work spanning modules, sessions, or subsystems, create or update an implementation plan before coding. Keep task status, decisions, and verification evidence current. Use the Heavy route only when the local harness provides it; otherwise use the host's equivalent planning workflow. For a small bounded change, work directly and record the acceptance checks before implementation.

Inspect applicable OpenKnit and module guidance, keep changes within the assigned ownership, and preserve unrelated work. Prefer cohesive module-owned changes and explicit interfaces. Do not claim an external client enforced a setup gate unless that specific consuming harness was inspected and verified.

## Verify and hand off

Run the checks that directly cover the changed behavior and report their exact results. Distinguish completed work from unverified assumptions or external blockers. Include useful file references and remaining decisions in the handoff.

If Notion is connected and relevant, use it only to enrich task context or preserve a user-requested record. A missing or unavailable Notion connector must not block the task.
