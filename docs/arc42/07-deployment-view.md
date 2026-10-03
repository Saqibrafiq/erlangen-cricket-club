# 7. Deployment View

```mermaid
flowchart TB
  subgraph dev[Developer machine]
    next_local[pnpm dev]
    pg_local[(Docker Postgres 17)]
    next_local --> pg_local
  end

  subgraph gh[GitHub]
    repo[Repository] --> ci[Actions: quality, build + E2E, Storybook]
  end

  subgraph vercel[Vercel Hobby]
    fn[Serverless functions: Next.js + Payload]
    cdn[Edge CDN: static pages, assets]
    blob[(Vercel Blob)]
  end

  neon[(Neon Postgres, Frankfurt)]

  ci -- "green main" --> vercel
  fn --> neon
  fn --> blob
  cdn --> fn
```

| Environment | Where                           | Database                                                     | Media            |
| ----------- | ------------------------------- | ------------------------------------------------------------ | ---------------- |
| Local       | `pnpm dev`                      | Docker Postgres on host port 5433 (`pnpm db:up`)             | `./media` folder |
| CI          | GitHub Actions                  | Ephemeral Postgres service, migrated and seeded before build | —                |
| Preview     | Vercel preview per PR (planned) | Neon branch (planned)                                        | Vercel Blob      |
| Production  | Vercel                          | Neon (EU region)                                             | Vercel Blob      |

Schema changes ship as migrations in `src/cms/migrations/`; production applies pending migrations on startup ([ADR-0004](09-architecture-decisions/0004-database-schema-via-migrations-only.md)). Because pages are prerendered from the database, every build needs a reachable, migrated database.

Configuration is provided through environment variables, validated at startup ([`src/shared/config/env.ts`](../../src/shared/config/env.ts)); see [`.env.example`](../../.env.example).
