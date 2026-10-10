# 0010. Instagram post graphics generated on request

- Status: accepted
- Date: 2026-10-10

## Context

The club posts on Instagram (`@er_cricketclub`): upcoming matches, results and new players. Editors make these images by hand today, which takes time and gives an inconsistent look. Instagram does not show link previews in posts (links are not clickable there), so Open Graph images would not help; the club needs ready-made post images. The data (fixtures, results, players with consent) is already in the CMS.

## Decision Drivers

- €0 and no new service or account.
- One click for a non-technical editor, right where they enter the data.
- Always matches the website's design and the latest saved data.
- Player images only with recorded consent (ADR-0009).

## Considered Options

1. **Generate on request with `next/og`** (Satori + Resvg, part of Next.js): a route returns a 1080×1350 PNG for a fixture or player; the admin shows download links.
2. Generate when saving (Payload `afterChange` hook) and store the PNGs in the media library.
3. A design tool template (e.g. Canva) the editors fill in by hand.

## Decision

Chosen option 1.

- Route `/instagram/{en|de}/{match|result|player}-{id|slug}.png`. The file extension keeps it outside the locale proxy, like `/calendar/fixture-{id}.ics` for "Add to calendar".
- `features/instagram` renders the graphics. Fonts (Barlow, OFL, self-hosted under `shared/assets/fonts`) and the crest are read from disk (`outputFileTracingIncludes` ships them to Vercel). Cut-out WebP photos are converted to PNG with sharp, because Satori cannot draw WebP.
- The fixture and player edit views get a sidebar UI field with download links in English and German. Result graphics only appear for completed fixtures, player graphics only with consent; the route returns 404 otherwise.
- Colours are fixed hex values of the brand tokens (`features/instagram/palette.ts`), because Satori cannot read CSS variables.
- Responses are `no-store`, so a download right after saving shows the new data.

## Consequences

- Good: no storage, nothing goes stale, no new dependency; the graphics share the result wording with the website (`describeResult`).
- Good: the same mechanism can produce other formats later (stories 1080×1920, link previews).
- Bad: each download costs a serverless function run (about a second). At club scale (a few posts a week) this is far inside the free tier.
- Bad: the palette duplicates the token values; a brand-colour change (R-3) must update both `globals.css` and `palette.ts`.
