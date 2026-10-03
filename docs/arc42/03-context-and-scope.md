# 3. Context & Scope

## 3.1 Business context (C4 level 1)

```mermaid
C4Context
  title System context — Erlangen Cricket Club platform

  Person(visitor, "Visitor", "Player, prospective member, fan, sponsor, recruiter")
  Person(editor, "Club editor", "Enters scorecards, players and stories")

  System(ecc, "ECC platform", "Public website and admin CMS")

  System_Ext(search, "Search engines", "Google, Bing")
  System_Ext(social, "Social networks", "Link previews via Open Graph")

  Rel(visitor, ecc, "Reads fixtures, stats, stories; sends membership enquiries", "HTTPS")
  Rel(editor, ecc, "Manages content", "HTTPS, /admin")
  Rel(search, ecc, "Crawls", "sitemap.xml, robots.txt, JSON-LD")
  Rel(social, ecc, "Fetches previews", "Open Graph")
```

| Partner         | Input to the platform               | Output from the platform                           |
| --------------- | ----------------------------------- | -------------------------------------------------- |
| Visitor         | Membership enquiries (planned)      | Localised pages (en/de)                            |
| Club editor     | Scorecards, players, stories, media | Admin UI                                           |
| Search engines  | —                                   | Sitemap, robots.txt, hreflang, structured data     |
| Social networks | —                                   | Open Graph / Twitter metadata, OG images (planned) |

## 3.2 Technical context

```mermaid
flowchart LR
  browser[Browser] -- HTTPS --> vercel[Vercel: Next.js + Payload]
  vercel -- "Postgres (TLS)" --> neon[(Neon PostgreSQL)]
  vercel -- HTTPS --> blob[(Vercel Blob: media)]
  vercel -. "errors (planned)" .-> sentry[Sentry]
  github[GitHub] -- "push / PR" --> actions[GitHub Actions CI]
  actions -- deploy --> vercel
```

Out of scope: online payments, live ball-by-ball scoring, a native mobile app.
