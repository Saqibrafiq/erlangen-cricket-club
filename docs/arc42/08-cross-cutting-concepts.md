# 8. Cross-cutting Concepts

## 8.1 Internationalisation

- next-intl with locales `en` (default) and `de`, prefix strategy `as-needed`: `/players` (en), `/de/players` (de).
- `src/proxy.ts` negotiates the locale; Payload paths (`/admin`, `/api`) are excluded.
- Messages in `src/i18n/messages/{en,de}.json`; a unit test ensures both catalogues have identical keys, and `AppConfig` typing makes unknown keys a type error.
- Payload content localisation uses the same locales; German falls back to English.
- Each localised route calls `resolveLocale(params)` (404 for unsupported locales, enables static rendering). See [ADR-0002](09-architecture-decisions/0002-keep-set-request-locale-until-root-params-support.md).
- **Pitfall — files without params:** `loading.tsx` and `not-found.tsx` render without route params, so server-side translations there fall back to `headers()` and make a static route dynamic (or fail with "static to dynamic" at runtime). Their translated content is therefore a client component reading messages from the layout's `NextIntlClientProvider` (`FixturesSkeleton`, `[locale]/not-found.tsx`).
- **Pitfall — notFound() under Suspense:** a `notFound()` thrown inside a `loading.tsx` boundary streams a 200 status. Validate dynamic segments in a segment `layout.tsx` instead (see runtime view 6.4).

## 8.2 Accessibility

- WCAG 2.2 AA. Semantic HTML first; one `h1` per page; skip link to `<main id="main-content">`.
- Global visible focus ring token (`--color-focus-ring`); `prefers-reduced-motion` disables transitions and animations.
- Enforcement: `eslint-plugin-jsx-a11y` (strict), axe in Playwright (`e2e/a11y.ts`) on every page, Storybook a11y addon set to fail on violations.

## 8.3 SEO

- Title template `%s | Erlangen Cricket Club` in the root layout; every route exports `generateMetadata`.
- `buildAlternates()` produces canonical + hreflang (`en`, `de`, `x-default`).
- `sitemap.ts` and `robots.ts` at the app root; `/admin` and `/api` disallowed.
- Site-wide JSON-LD `SportsOrganization`; per-feature schemas (`SportsEvent`, `Article`, `BreadcrumbList`) to follow.

## 8.4 Design system

- Tailwind CSS v4 with tokens in `@theme` (`src/app/(frontend)/globals.css`), named `--{category}-{role}-{variant}`.
- Dark mode reassigns token values under `prefers-color-scheme: dark`; components never need `dark:` variants.
- Components in `src/shared/ui/` follow shadcn/ui conventions: `cva` variants, `cn()` merging, Radix primitives, a story and a test for each.
- **Typography:** Inter (body) and Barlow Condensed (`font-display`: h1/h2, scores, stats), both self-hosted via `next/font`.
- **Match cards:** the winner is emphasised (losing team and score muted), team monograms identify clubs (brand colour for ECC teams). The club outcome is shown by a text badge (Won/Lost/Tied), never by colour alone.
- **Header:** one slim row (logo, EN/DE switcher, navigation), sticky on every screen size with a translucent blur. The EN/DE switcher names each language in itself.
- **Page width:** every page uses `Container`. `wide` (full width with gutters, no maximum) is the default for layout — header, lists, grids — so all pages share one left edge. `prose` (max 768 px, ~65–75 characters per line) is only for long-form reading such as news articles and legal pages. Data views use the width: e.g. fixtures show a fixed 16rem filter sidebar from `lg` (`grid-cols-sidebar`) and a card grid that fits as many ≥20rem columns as the space allows (`grid-cols-cards`): one on phones, five or six on wide monitors.
- **Cards look the same with less or more data:** a card always renders the same sections (fixture card: header, teams, result, meta), filling gaps with a status text instead of omitting a section, and rows have a minimum height. In grids, cards use CSS subgrid (`row-span-4 grid-rows-subgrid`) so sections line up across every card in a row.

- **Data tables:** standings are plain server-rendered tables in published order and columns (no sorting: the ranking is the content). Numbers right-aligned with tabular figures; points in the display face; win % with a decorative bar; overs muted next to runs; position chips (brand colour for the club). Row labels are `th scope="row"` in a sticky first column. On phones, cells are compact and teams show their league code (full name kept for screen readers), so position through points fit without scrolling; the rest scrolls inside a focusable, named region. A legend explains the abbreviations.
- **News cards:** a container query switches any wide card (the lead story, or a lone card in its row) to image-beside-text; narrow cards stack. Logos (e.g. sponsors) sit whole on `--color-surface-logo`, which stays white in dark mode because third-party logos are designed for white. Articles without an image keep the card shape with a club-branded panel.
- **Text on photos:** hero images get a gradient in `--color-media-overlay` with `--color-text-on-media` (both fixed in dark mode); buttons there use the `on-media` and `on-media-outline` variants.
- **Summary cards ("Our teams"):** a club team's place in a table (ordinal position, points, won, lost, NRR) above the tables. Cards use a container query (`@container`) to switch to a one-row banner when the card itself is wide, so the same component works in a grid and full width; `grid-cols-cards-fit` lets fewer cards stretch to fill the row.
- **Header layout:** from `xl` (1280 px) the navigation sits in the header row, with dropdown panels for sections that have sub-pages. Below `xl`, a **Menu** button opens a slide-in panel (Radix Dialog: focus trap, Escape closes, focus returns to the button). In the panel, sections with sub-pages are native `<details>` disclosures, and the section of the current page is opened automatically. Top-level links carry `aria-current="page"` on their page and `"true"` on pages below it. The panel slides in only under `prefers-reduced-motion: no-preference`.

## 8.5 Cricket calculations

- All cricket maths lives in `domain/cricket` (pure, 100% branch coverage) and is **derived** from stored results: margins and outcomes, later player statistics.
- Exception: standings are the leagues' published tables, entered by editors ([ADR-0006](09-architecture-decisions/0006-standings-from-published-tables.md)).

## 8.6 Configuration and error handling

- Server env validated by Zod at startup (`parseServerEnv`) — misconfiguration fails the deployment, not a request.
- Public env (`NEXT_PUBLIC_SITE_URL`) validated with a safe default in `siteConfig`.
- Errors: typed results or domain errors (e.g. `RangeError` for invalid stats input); route-level `error.tsx` boundaries arrive with the first data-driven feature.

## 8.7 Security

- **Third-party content:** nothing from another server loads without the visitor asking: the ground map is a two-click OpenStreetMap embed ([ADR-0008](09-architecture-decisions/0008-maps-load-on-request.md)); fonts are self-hosted.
- **Public forms:** data minimisation (only what is needed to reply), server-side Zod validation, a honeypot instead of a captcha (no cookies, no third-party script), personal data readable by signed-in editors only. Form fields use `shared/ui/FormField` (label, hint and error wired with `aria-describedby`; invalid controls get `aria-invalid`); after a failed submit, focus moves to the first invalid field. See [ADR-0007](09-architecture-decisions/0007-contact-messages-stored-in-cms.md).

- Payload access control per collection (`src/cms/access/`); public read only where content is public.
- JSON-LD output escapes `<` to prevent script injection from CMS content.
- Secrets only in `.env.local` / Vercel environment variables.

## 8.8 Testing

| Level         | Tool                                | Scope                                                     |
| ------------- | ----------------------------------- | --------------------------------------------------------- |
| Unit          | Vitest                              | `domain/` (100% coverage threshold), `shared/lib`, config |
| Component     | Vitest + RTL + user-event           | `shared/ui`, feature components (accessible queries)      |
| Visual / a11y | Storybook + addon-a11y              | All variants and states of `shared/ui`                    |
| E2E           | Playwright + axe (mobile + desktop) | Happy path and accessibility per page                     |
