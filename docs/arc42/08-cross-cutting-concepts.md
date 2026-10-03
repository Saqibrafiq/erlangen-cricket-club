# 8. Cross-cutting Concepts

## 8.1 Internationalisation

- next-intl with locales `en` (default) and `de`, prefix strategy `as-needed`: `/players` (en), `/de/players` (de).
- `src/proxy.ts` negotiates the locale; Payload paths (`/admin`, `/api`) are excluded.
- Messages in `src/i18n/messages/{en,de}.json`; a unit test ensures both catalogues have identical keys, and `AppConfig` typing makes unknown keys a type error.
- Payload content localisation uses the same locales; German falls back to English.
- Each localised route calls `resolveLocale(params)` (404 for unsupported locales, enables static rendering). See [ADR-0002](09-architecture-decisions/0002-keep-set-request-locale-until-root-params-support.md).

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

## 8.5 Configuration and error handling

- Server env validated by Zod at startup (`parseServerEnv`) — misconfiguration fails the deployment, not a request.
- Public env (`NEXT_PUBLIC_SITE_URL`) validated with a safe default in `siteConfig`.
- Errors: typed results or domain errors (e.g. `RangeError` for invalid stats input); route-level `error.tsx` boundaries arrive with the first data-driven feature.

## 8.6 Security

- Payload access control per collection (`src/cms/access/`); public read only where content is public.
- JSON-LD output escapes `<` to prevent script injection from CMS content.
- Secrets only in `.env.local` / Vercel environment variables.

## 8.7 Testing

| Level         | Tool                                | Scope                                                     |
| ------------- | ----------------------------------- | --------------------------------------------------------- |
| Unit          | Vitest                              | `domain/` (100% coverage threshold), `shared/lib`, config |
| Component     | Vitest + RTL + user-event           | `shared/ui`, feature components (accessible queries)      |
| Visual / a11y | Storybook + addon-a11y              | All variants and states of `shared/ui`                    |
| E2E           | Playwright + axe (mobile + desktop) | Happy path and accessibility per page                     |
