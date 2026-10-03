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

## 6.2 Editor publishes content (planned)

```mermaid
sequenceDiagram
  participant E as Editor
  participant A as Payload admin
  participant DB as PostgreSQL
  participant H as afterChange hook
  participant N as Next.js cache

  E->>A: Save scorecard
  A->>DB: write match + performances
  A->>H: afterChange(doc)
  H->>N: revalidateTag("fixtures"), revalidateTag("player:<slug>")
  Note over N: Next visitor request regenerates affected pages
```
