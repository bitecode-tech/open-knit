---
name: backend-db-guidelines-open-knit
description: Use when implementing or reviewing persistence changes in the Open Knit backend, including entities, repositories, migrations, and transaction or query behavior. Keep database work within module schema boundaries.
---

# Backend DB Guidelines For Open Knit

Use this skill for persistence and database-backed workflow changes in `open-knit`.

## Core Rule

Flyway is the schema source of truth.

That means:

- never modify applied migrations
- add new forward migrations instead
- keep migrations under `src/main/resources/db/migration/<schema>/`
- do not duplicate migration-owned schema constraints in entity annotations unless required for runtime mapping

## Schema And Module Ownership

- The backend uses PostgreSQL with schema-per-module ownership.
- Keep each module responsible for its own schema and migrations.
- Do not create casual cross-module persistence coupling.

## Entities

- Use `UuidBaseEntity` for externally exposed entities and UUID-based API access patterns.
- Do not expose internal numeric IDs in public APIs.
- Keep entities lean and persistence-focused.

## Query Access

- Access the database through repository methods, repository `@Query`, or QueryDSL.
- Do not execute direct SQL from controllers or services.
- Use QueryDSL when query shape depends on optional or dynamic filters.

## Transactions And Locks

- Services own transaction boundaries.
- Prefer DB constraints first.
- For same-row updates, prefer optimistic locking.
- For multi-step workflows, prefer atomic claim updates or row locks when needed.
- Use in-memory locks only when single-JVM coordination is truly sufficient.

## Performance And Query Shape

- Default relationships and query behavior should be intentional, not accidental.
- Avoid N+1 behavior in service and mapper paths.
- Use projections, fetch shaping, or repository query refinement where needed.

## Migration Conventions

- Keep column order consistent:
  - `id` first
  - `uuid` second when present
  - domain fields next
  - `created_date` and `updated_date` last

## Verification

- Run `cd backend && ./gradlew compileJava --warning-mode=none`
- Run affected integration tests when persistence behavior changes
- Do not leave new failing migrations behind
