# 5. Building Block View

## 5.1 Containers (C4 level 2)

```mermaid
C4Container
  title Containers — ECC platform

  Person(visitor, "Visitor")
  Person(editor, "Club editor")

  System_Boundary(ecc, "ECC platform (one Next.js deployment)") {
    Container(web, "Public website", "Next.js App Router, RSC", "Localised pages under /[locale]")
    Container(admin, "Admin CMS", "Payload CMS 3", "Admin UI at /admin, REST at /api")
  }

  ContainerDb(db, "Database", "PostgreSQL (Neon)", "Content and scorecards")
  ContainerDb(blob, "Media storage", "Vercel Blob", "Images")

  Rel(visitor, web, "Uses", "HTTPS")
  Rel(editor, admin, "Uses", "HTTPS")
  Rel(web, db, "Reads via Payload Local API")
  Rel(admin, db, "Reads/writes")
  Rel(admin, blob, "Uploads media")
```

## 5.2 Modules (C4 level 3) — `src/`

```mermaid
flowchart TD
  app["app/ — routes only"] --> features["features/* — vertical slices (public index.ts)"]
  app --> shared["shared/ — design system, utilities, config"]
  app --> i18n["i18n/ — routing, messages"]
  features --> domain["domain/ — pure cricket logic"]
  features --> shared
  features -- "server/ only" --> cms["cms/ — Payload collections, access, hooks"]
  shared --> i18n
  cms --> i18n
```

| Module               | Responsibility                                                       | May depend on                              |
| -------------------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `app/`               | Route composition, metadata; no business logic                       | features (via `index.ts`), shared, i18n    |
| `features/<x>/`      | One business capability (players, fixtures, …)                       | domain, shared, other features' `index.ts` |
| `features/*/server/` | Data access through the Payload Local API                            | + Payload                                  |
| `domain/`            | Pure TypeScript: averages, strike rate, economy, NRR, milestones     | nothing outside `domain/`                  |
| `shared/`            | `ui/` design system, `lib/` utilities, `config/` env and site config | i18n                                       |
| `cms/`               | Payload collections, globals, access control, hooks                  | Payload, i18n                              |
| `i18n/`              | Locales, routing, message catalogues                                 | next-intl                                  |

These rules are encoded in [`.dependency-cruiser.cjs`](../../.dependency-cruiser.cjs) and checked in CI.

### Current contents

| Path               | Contents                                                |
| ------------------ | ------------------------------------------------------- |
| `domain/cricket/`  | `calculateBattingAverage`, `calculateStrikeRate`        |
| `shared/ui/`       | `Button`, `SkipLink`, `JsonLd`                          |
| `shared/lib/`      | `cn`, SEO helpers (`buildAlternates`, JSON-LD builders) |
| `shared/config/`   | `parseServerEnv` (Zod), `siteConfig`                    |
| `cms/collections/` | `users`, `media`                                        |
| `features/`        | Empty — features arrive in follow-up PRs                |
