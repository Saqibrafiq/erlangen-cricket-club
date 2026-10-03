# 0004. Database schema changes via migrations only

- Status: accepted
- Date: 2026-10-03

## Context

Payload's Postgres adapter can "push" schema changes automatically in development, while production requires migrations. Mixing both lets local databases drift from production and makes the first deployment of a change the first real test of its migration. Pages are statically generated from the database at build time, so CI and Vercel builds need a migrated schema too.

## Decision Drivers

- Reliability of deployments (Vercel has no separate release step).
- Parity between local, CI and production databases.
- Low ceremony for a single developer.

## Considered Options

1. **Migrations everywhere** (`push: false`), applied automatically on production startup via `prodMigrations`.
2. Push in development, migrations for production (Payload default).

## Decision

Chosen option 1.

- Change a collection → `pnpm db:migrate:create <name>` → review the generated SQL → `pnpm db:migrate`.
- Migrations live in `src/cms/migrations/` (generated; excluded from lint and formatting).
- Production applies pending migrations when Payload initialises (`prodMigrations`); CI runs `pnpm db:migrate` against an ephemeral Postgres before building.

## Consequences

- Good: every schema change is reviewed SQL in a PR and exercised by CI before it reaches production.
- Bad: one extra command per schema change during development.
