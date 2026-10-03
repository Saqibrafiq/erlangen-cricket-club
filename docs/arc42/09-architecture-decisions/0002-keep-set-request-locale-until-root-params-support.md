# 0002. Keep next-intl `setRequestLocale` until root params work

- Status: accepted
- Date: 2026-10-03
- Deviates from: `CLAUDE.md` §3 "Never use deprecated APIs"

## Context

next-intl 4.14 deprecates `setRequestLocale()` and the `requestLocale` parameter of `getRequestConfig` in favour of Next.js `next/root-params`.

`next/root-params` exposes params of the **root layout**. Next.js 16.3 detects root layouts by URL path after removing route groups. Payload's generated root layout `src/app/(payload)/layout.tsx` maps to `/`, so Next treats it as the only root layout and `/[locale]` as nested under it. Result: no root params are detected (`.next/types/root-params.d.ts` reports "No root params detected"), and the compiler-generated `next/root-params` module has no `locale` export.

## Decision Drivers

- Static rendering of localised pages (performance, quality goal 3).
- Payload's admin files are generated and must not be hand-edited (`CLAUDE.md` §4.2).
- Prefer supported, non-deprecated APIs.

## Considered Options

1. **Keep `setRequestLocale` / `requestLocale`** (deprecated, still fully functional) behind one helper.
2. Move Payload's root layout to `(payload)/admin/layout.tsx` so both root layouts are detected — modifies generated files and is overwritten on Payload upgrades.
3. Drop static rendering and read the locale from headers — loses static generation for all public pages.

## Decision

Chosen option 1. The deprecated calls are confined to exactly two places, each with a targeted `eslint-disable` that references this ADR:

- `src/i18n/locale.ts` — `resolveLocale()` calls `setRequestLocale`.
- `src/i18n/request.ts` — reads `requestLocale`.

## Consequences

- Good: pages under `/[locale]` stay statically generated; no generated Payload files are touched.
- Bad: a deprecated API remains in use; a future next-intl major may remove it.
- Revisit when any of these happens: Next.js detects root layouts per route group, Payload supports a nested admin layout, or next-intl announces removal. Migration is local to the two files above.
