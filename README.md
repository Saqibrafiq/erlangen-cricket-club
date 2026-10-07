# Erlangen Cricket Club

Website and content platform for [Erlangen Cricket Club](https://erlangencricketclub.wordpress.com/) in Erlangen, Bavaria — bilingual (English/German), accessible (WCAG 2.2 AA) and running at €0 on free tiers.

**Stack:** Next.js 16 (App Router, RSC) · React 19 · TypeScript (strict) · Payload CMS 3 · PostgreSQL · Tailwind CSS v4 · shadcn/ui · next-intl · Vitest · Playwright + axe · Storybook

## Getting started

Prerequisites: Node.js 24 (`.nvmrc`), Corepack-enabled pnpm, Docker.

```bash
corepack enable
pnpm install
cp .env.example .env.local   # then set PAYLOAD_SECRET
pnpm db:up                   # local PostgreSQL in Docker (host port 5433)
pnpm db:migrate              # create the schema
pnpm db:seed                 # optional: 2026 results of ECC-I and ECC-II
pnpm dev
```

- Website: http://localhost:3000 (German: http://localhost:3000/de)
- Fixtures & Results: http://localhost:3000/fixtures (all fixtures, filterable by competition and status, e.g. `?status=forfeit`); one page per competition, e.g. /fixtures/bcv-regionalliga-bayern-2026
- Standings: http://localhost:3000/standings (league tables as published, entered per competition in the admin, see ADR-0006); one table per competition, e.g. /standings/bcv-t20-regionalliga-bayern-2026
- News: http://localhost:3000/news (articles from the `news` collection; the seed imports 24 articles and their photos from the old WordPress site)
- Membership: http://localhost:3000/membership (content from the `membership` global)
- Contact: http://localhost:3000/contact (details from the `contact` global; messages appear in the admin under Club → Contact messages)
- Admin: http://localhost:3000/admin — create the first user on first visit

The Docker database uses host port **5433** so it does not clash with a locally installed PostgreSQL on 5432.

## Scripts

| Script                          | Purpose                                                                                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                      | Development server (Turbopack)                                                                                                               |
| `pnpm build` / `start`          | Production build / server                                                                                                                    |
| `pnpm lint`                     | ESLint (typescript-eslint strict, jsx-a11y strict)                                                                                           |
| `pnpm typecheck`                | Generate route types and run `tsc`                                                                                                           |
| `pnpm depcruise`                | Check architecture rules (`.dependency-cruiser.cjs`)                                                                                         |
| `pnpm test`                     | Unit and component tests (Vitest)                                                                                                            |
| `pnpm test:coverage`            | Tests with coverage (100% required for `src/domain`)                                                                                         |
| `pnpm test:e2e`                 | Playwright E2E + axe (set `E2E_PORT` to change the port)                                                                                     |
| `pnpm storybook`                | Component workshop on http://localhost:6006                                                                                                  |
| `pnpm generate:types`           | Regenerate `src/payload-types.ts` after collection changes                                                                                   |
| `pnpm db:up` / `db:down`        | Start / stop local PostgreSQL                                                                                                                |
| `pnpm db:migrate`               | Apply pending migrations                                                                                                                     |
| `pnpm db:migrate:create <name>` | Create a migration after changing collections ([ADR-0004](docs/arc42/09-architecture-decisions/0004-database-schema-via-migrations-only.md)) |
| `pnpm db:seed`                  | Import seed data (idempotent; never overwrites admin edits)                                                                                  |

## Architecture

A modular monolith with vertical feature slices — see the [arc42 documentation](docs/arc42/README.md) and [architecture decisions](docs/arc42/09-architecture-decisions/README.md).

```
src/
  app/          routes only — (frontend)/[locale] and (payload) admin
  features/     vertical slices, each with a public index.ts
  domain/       pure cricket logic (no framework imports)
  shared/       design system (ui), utilities (lib), config
  cms/          Payload collections, access control, hooks
  i18n/         locales, routing, messages
```

## Contributing

Trunk-based: short-lived branches (`type/short-description`) → PR → squash merge. Commits follow [Conventional Commits](https://www.conventionalcommits.org/) and are checked by commitlint; staged files are linted and formatted on commit. Project rules live in [`CLAUDE.md`](CLAUDE.md).
