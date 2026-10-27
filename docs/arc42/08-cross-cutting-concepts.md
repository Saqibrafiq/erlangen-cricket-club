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
- **Header:** one slim row (crest and club name, navigation, language menu), sticky on every screen size with a translucent blur. The language menu (Radix DropdownMenu) shows the current flag and code; it lists each language named in itself with its flag (SVG, since Windows shows flag emoji as letters) and links to the same page in that language.
- **Club crest:** the crest from the old website, with its horizontal stretch undone (the cricket ball was an oval) and the exterior made transparent so it works on light and dark, sits before the club name in the header; on phones the crest stands alone and the name stays as the link's accessible name. The same crest is the favicon (`app/icon.png`).
- **Footer:** a dark club-green band with the club (crest, one line, social icons), three link columns (Club, Matches, Join), "Visit us" (training time from the membership global, ground and email from the contact global), then a bottom bar: the club's copyright and content note, the legal pages, and the website's credit and code copyright ([ADR-0012](09-architecture-decisions/0012-proprietary-licence.md)). On phones the three link columns stay side by side.
- **Ground scoreboard (home page):** the next match countdown (inside a glass card) and the season record are drawn as an LED scoreboard: one dark cell per character (`--color-scoreboard`), amber LED dots in the yellow of the club kit (`--color-led`, `led-matrix` mask, `led-glow`), an unlit "8" faintly behind each digit. The digits are decorative; every value is also given as text for assistive technology. It is the page's one signature element; the sections around it stay plain (no labels above headings, no arrows on links, no fade-in on every section).
- **Motion and scrollytelling:** animations use Motion (`motion/react`), Apple-style. The hero stays pinned while the page slides up over it, shrinking and dimming as it is covered (`HeroScroll`; it pins at its bottom edge, so a tall phone hero is seen in full first). A pinned statement lights up word by word as the page scrolls (`ScrollStatement`). The season scoreboard counts up once (`CountUp`), the countdown digits flip every second, and the squad is a pinned line-up whose players step in with the scroll (`SquadStory`, centred with its heading so the spacing is the same on every screen). Only transforms and opacity are animated. Reduced motion is honoured in two layers: `MotionProvider` (`MotionConfig reducedMotion="user"`) turns off movement, and scroll-linked inline styles are overridden with `motion-reduce:` classes; the pinned scenes then become plain sections. The markup is the same either way, so there is no hydration mismatch. Accessibility checks in E2E run with reduced motion, so axe never measures an element mid-fade.
- **Page width:** every page uses `Container`. `wide` (full width with gutters up to `--container-page`, 100rem, then centred, so pages stay together on large monitors) is the default for layout — header, lists, grids — so all pages share one left edge. `prose` (max 768 px, ~65–75 characters per line) is only for long-form reading such as news articles and legal pages. Data views use the width: e.g. fixtures show a fixed 16rem filter sidebar from `lg` (`grid-cols-sidebar`) and a card grid that fits as many ≥20rem columns as the space allows (`grid-cols-cards`): one on phones, five or six on wide monitors.
- **Screen heights:** the `short` variant (max 50rem tall, laptops) makes first screens compact so the home hero with its next match card fits without scrolling; the `tall` variant (min 62rem) gives full-screen scenes larger type. Pinned scenes start below the sticky header (`top-16`, `h-hero`); the home hero is at most 60rem tall (`min-h-hero`), so on tall monitors the next section is already in view.
- **Cards look the same with less or more data:** a card always renders the same sections (fixture card: header, teams, result, meta), filling gaps with a status text instead of omitting a section, and rows have a minimum height. In grids, cards use CSS subgrid (`row-span-4 grid-rows-subgrid`) so sections line up across every card in a row.

- **Data tables:** standings are plain server-rendered tables in published order and columns (no sorting: the ranking is the content). Numbers right-aligned with tabular figures; points in the display face; win % with a decorative bar; overs muted next to runs; position chips (brand colour for the club). Row labels are `th scope="row"` in a sticky first column. On phones, cells are compact and teams show their league code (full name kept for screen readers), so position through points fit without scrolling; the rest scrolls inside a focusable, named region. A legend explains the abbreviations.
- **News cards:** a container query switches any wide card (the lead story, or a lone card in its row) to image-beside-text; narrow cards stack. Logos (e.g. sponsors) sit whole on `--color-surface-logo`, which stays white in dark mode because third-party logos are designed for white. Articles without an image keep the card shape with a club-branded panel.
- **Text on photos:** hero images get a gradient in `--color-media-overlay` with `--color-text-on-media` (both fixed in dark mode); buttons there use the `on-media` and `on-media-outline` variants.
- **Summary cards ("Our teams"):** a club team's place in a table (ordinal position, points, won, lost, NRR) above the tables. Cards use a container query (`@container`) to switch to a one-row banner when the card itself is wide, so the same component works in a grid and full width; `grid-cols-cards-fit` lets fewer cards stretch to fill the row.
- **Header layout:** from `xl` (1280 px) the navigation sits in the header row (items never wrap; their padding is tighter up to `2xl` so nine items with German labels fit at 1280 px), with dropdown panels for sections that have sub-pages. Below `xl`, a **Menu** button opens a slide-in panel (Radix Dialog: focus trap, Escape closes, focus returns to the button). In the panel, sections with sub-pages are native `<details>` disclosures, and the section of the current page is opened automatically. Top-level links carry `aria-current="page"` on their page and `"true"` on pages below it. The panel slides in only under `prefers-reduced-motion: no-preference`.

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

- **Editor sign-in** ([ADR-0014](09-architecture-decisions/0014-club-sign-in-page-on-payload-auth.md)):
  - `/login` (`features/auth`) signs in through Payload's Local API and sets Payload's own session cookie (`payload-token`: `HttpOnly`, `SameSite=Lax`, `Secure` in production, 2 h);
  - Payload locks an account for 10 minutes after 5 wrong passwords, and the error never says whether the email or the password was wrong;
  - `?redirect=` only accepts paths on this site, so the login can't be used as an open redirect; without one, editors land on the website in edit mode;
  - Payload's `/admin/login` forwards to `/login`;
  - the header's admin icon is a static link, so no page reads the session cookie and the public pages stay static.
- **Editing on the website** ([ADR-0015](09-architecture-decisions/0015-edit-content-on-the-website.md)):
  - signing in also sets a readable hint cookie (`ecc-editor`, `shared/config/edit-mode.ts`); static pages read it in the browser (`useIsEditMode`) and only then load their editing controls via `next/dynamic`, so visitors download no editing code;
  - the hint grants nothing: every editing server action checks the Payload session itself and writes as that user with access control on (`overrideAccess: false`); IDs, locales and form fields are validated with Zod, and photos by type and size;
  - player photos are cut out in the editor's browser like the existing squad photos: MODNet matting, edge colour clean-up, head and shoulders, 720 px WebP. The model and ONNX runtime are served from our own domain ([ADR-0016](09-architecture-decisions/0016-player-photo-background-removal-in-the-browser.md)). Other photos are shrunk (`resizeImage`, WebP, at most 1200 px). Server actions accept up to 4 MB, below Vercel's 4.5 MB request limit;
  - the admin bar under the header signs out through Payload's `logout`, which also ends the session server-side;
  - routes pass the server actions to the editing components as props (`PLAYER_EDITING`), like the contact form.
- **Editing news** ([ADR-0017](09-architecture-decisions/0017-edit-news-on-the-website.md)):
  - a visual editor (`shared/ui/RichTextEditor`, Lexical 0.50.0 like Payload) writes Payload-compatible rich text; links are converted between the two shapes in `features/news/domain/rich-text.ts`;
  - articles with content only the admin can edit keep their text read-only on the website;
  - a new article is written in every language; images upload one per request;
  - drafts are listed for editors only;
  - `EditActions` and `EditorToolbar` (`shared/ui`) serve players, news and sponsors alike.
- **Editing sponsors** (same pattern, `SPONSOR_EDITING`):
  - the form shows a live preview of the real `SponsorCard`, and the logo on the same white panel (drop or choose; shrunk to at most 800 px WebP);
  - English and German descriptions are edited together, and a new sponsor is saved in both languages;
  - unticking "Show on the website" hides a sponsor; hidden sponsors are listed as past sponsors for editors;
  - logos stay in the media library when a sponsor is deleted or gets a new logo, because news articles may show the same image.
- **Importing league tables** ([ADR-0018](09-architecture-decisions/0018-import-league-tables-from-cricclubs-csv.md)): editors drop the CricClubs points table export on the standings page, check the changes and the table, then confirm. A new season's competition is created in the same step; teams new to us are added from their CricClubs code.
- **Seasons:**
  - the current season is the newest one with a competition: as soon as a 2027 competition exists, `/standings`, the home page and the import list show only 2027;
  - past seasons are linked from a season switcher on the standings page (`/standings/season/2026`, in the sitemap), and each competition keeps its own page;
  - the header menus already listed only the newest season.
- **After an edit** (`shared/lib/use-refresh-then.ts`): every editor refreshes the page (or navigates away) and closes only once the new page is on screen.
- **Deleting** (`shared/ui/Vanish`, `shared/lib/use-vanishing.ts`):
  - a deleted card crumbles into dust and drifts away before the list refreshes;
  - the effect is an SVG turbulence and displacement filter animated with Motion, about 1.4 s long;
  - under `prefers-reduced-motion` the card only fades out;
  - the confirm dialog closes first so the effect is visible;
  - a timeout lets the delete finish even if the card is not on screen.
- **Fresh pages after edits:** collection hooks call `revalidatePath('/(frontend)/[locale]', 'layout')`. The route group must be part of the path, otherwise nothing is invalidated and prerendered pages keep their build-time content. Inside a server action, the editor's page updates in the same response; visitors get the new version on their next visit.
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
