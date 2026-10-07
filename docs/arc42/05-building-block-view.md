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

| Path                  | Contents                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain/cricket/`     | Batting average, strike rate, overs notation, `resolveMatchResult`, `getTeamOutcome`                                                                                |
| `shared/ui/`          | `Button`, `Badge`, `Skeleton`, `Container`, `SkipLink`, `JsonLd`, `SiteHeader`, `SiteFooter`, `NavLink`, `NavMenu`, `LocaleSwitcher`, `Breadcrumbs`, `TeamMonogram` |
| `shared/lib/`         | `cn`, `slugify`, `getMonogram`, SEO helpers (`buildAlternates`, `BreadcrumbList` / `SportsOrganization` JSON-LD)                                                    |
| `shared/config/`      | `parseServerEnv` (Zod), `siteConfig`, `MAIN_NAVIGATION`                                                                                                             |
| `cms/collections/`    | `fixtures`, `teams`, `competitions` (with `slug`, `standings`), `news` (drafts), `media`, `users`                                                                   |
| `cms/globals/`        | `impressum`, `privacy-policy` (localised rich text)                                                                                                                 |
| `cms/hooks/`          | Fixture title, on-demand revalidation of all localised pages                                                                                                        |
| `cms/seed/`           | Idempotent import of 2026 results: ECC-I (DCB-Bundesliga Südost, BCV T20 Regionalliga), ECC-II (BCV Regionalliga, BCV T20 1. Verbandsliga)                          |
| `features/standings/` | League tables — see below                                                                                                                                           |
| `features/news/`      | News articles — see below                                                                                                                                           |
| `features/fixtures/`  | Fixtures & Results — see below                                                                                                                                      |
| `features/legal/`     | Impressum and Datenschutz pages: content from Payload globals (`impressum`, `privacy-policy`), rich text, localised                                                 |

### `features/fixtures`

Routes ([ADR-0005](09-architecture-decisions/0005-fixtures-pages-per-competition.md)):

| Route                       | Content                                                                                                                                       |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `/fixtures`                 | All fixtures together; filters: competition (grouped by team), status (upcoming, completed, abandoned, walkover, forfeit), result (won, lost) |
| `/fixtures/[competition]`   | One competition: record, fixtures filterable by status and result, breadcrumbs                                                                |
| Header menu (locale layout) | Latest season's competitions grouped by club team                                                                                             |

```mermaid
flowchart LR
  pages["app/[locale]/fixtures/*<br/>layout.tsx (header menu)"] --> index["features/fixtures/index.ts"]
  index --> queries["server/queries.ts<br/>Payload Local API"]
  queries --> mapper["server/map-fixture.ts<br/>doc → FixtureSummary"]
  mapper --> domain["domain/cricket<br/>resolveMatchResult"]
  queries --> fdomain["domain/<br/>summariseCompetitions, groupCompetitionsByTeam,<br/>fixture-filters (category, URL state)"]
  index --> components["components/<br/>FixturesOverview, CompetitionFixtures,<br/>FilterableFixtures → FixtureFilters (client),<br/>FixtureCard, ClubRecord"]
  index --> menu["domain/build-competition-menu<br/>→ shared/ui NavMenu groups"]
```

The mapper is the anti-corruption layer between Payload's document shape and the UI's view model; components never see Payload types.

`buildCompetitionMenu` is shared with standings: the header's Fixtures and Standings dropdowns list the same competitions, each linking to its own section.

### `features/standings`

Routes ([ADR-0006](09-architecture-decisions/0006-standings-from-published-tables.md)):

| Route                       | Content                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `/standings`                | One table per competition (latest season first)                 |
| `/standings/[competition]`  | One table, link to the competition's fixtures, breadcrumbs      |
| Header menu (locale layout) | Same competitions as the Fixtures menu (`buildCompetitionMenu`) |

```mermaid
flowchart LR
  pages["app/[locale]/standings/*"] --> index["features/standings/index.ts"]
  index --> queries["server/queries.ts"]
  queries --> mapper["server/map-standings.ts<br/>competition.standings → rows"]
  index --> components["components/<br/>StandingsTable (server, published order),<br/>CompetitionStandingsView, StandingsOverview"]
```

Standings are the published table stored on the competition (`competitions.standings`); they do not read fixtures.

### `features/news`

| Route          | Content                                                                                          |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `/news`        | Published articles, newest first: the latest as a wide lead card, the rest in a card grid        |
| `/news/[slug]` | Article: date, title, featured image (photo, or a sponsor logo shown whole), body, photo gallery |

Articles live in the Payload `news` collection (localised title, excerpt and body; drafts via versions). Public queries filter on `_status: published` because the Local API bypasses access control; the collection's read access additionally hides drafts from anonymous REST requests. `server/map-news.ts` maps documents to view models (`NewsSummary`, `NewsArticle`); pages emit `NewsArticle` and `BreadcrumbList` JSON-LD, Open Graph article metadata and sitemap entries with `lastModified`.
