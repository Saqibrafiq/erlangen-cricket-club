# 6. Runtime View

## 6.1 Visitor requests a localised page

```mermaid
sequenceDiagram
  participant B as Browser
  participant P as proxy.ts (next-intl)
  participant N as Next.js (RSC)
  participant C as Vercel CDN

  B->>C: GET /de
  alt cached static page
    C-->>B: HTML (static per locale)
  else miss / revalidated
    C->>P: GET /de
    P->>N: route /[locale] with locale=de
    N->>N: resolveLocale → load de.json messages
    N-->>C: HTML + Cache headers
    C-->>B: HTML
  end
```

Requests to `/` are served in English (default locale, no prefix). Unknown paths under a locale render the localised `not-found` page with HTTP 404.

## 6.2 Editor records a result

```mermaid
sequenceDiagram
  participant E as Editor
  participant A as Payload admin
  participant V as Field validation
  participant DB as PostgreSQL
  participant H as afterChange hook
  participant N as Next.js cache

  E->>A: Save fixture (status completed, 2 innings)
  A->>V: overs notation, wickets ≤ 10, batting teams in fixture
  V-->>A: ok
  A->>DB: write fixture + innings
  A->>H: afterChange(doc)
  H->>N: revalidatePath("/[locale]", "layout")
  Note over N: Next requests regenerate every localised page<br/>(the header menu lists competitions)
```

Winner and margin are not stored for results decided on the field: `mapFixture` derives them with `resolveMatchResult` whenever the page is regenerated. Seeds and scripts pass `context.disableRevalidate` because they run outside a Next.js request.

## 6.3 Fixtures pages build

`/fixtures` and every `/fixtures/[competition]` page are statically generated for both locales at build time (`generateStaticParams` reads competition slugs from the database). A competition created after the build renders on its first request and is then cached.

## 6.4 Unknown competition

```mermaid
sequenceDiagram
  participant B as Browser
  participant L as [competition]/layout.tsx
  participant P as page.tsx (inside loading.tsx Suspense)
  participant NF as [locale]/not-found.tsx (client)

  B->>L: GET /fixtures/no-such-competition
  L->>L: getCompetitionDetail(slug) → null
  L->>NF: notFound()
  NF-->>B: 404, localised message
```

The slug is validated in the segment **layout**, outside the page's `loading.tsx` Suspense boundary; throwing `notFound()` inside that boundary would already have streamed a 200 status. `getCompetitionDetail` is wrapped in React `cache()`, so layout, metadata and page share one query.
