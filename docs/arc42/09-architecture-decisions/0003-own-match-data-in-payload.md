# 0003. Own match data in Payload; import from CricClubs, never scrape

- Status: accepted
- Date: 2026-10-03

## Context

The Bayerischer Cricket Verband publishes fixtures and results on CricClubs. The club website needs the same data for ECC teams, in English and German, statically rendered for performance and SEO. CricClubs answers automated requests with HTTP 403, offers no public API, and its terms do not grant reuse through scraping.

## Decision Drivers

- Data correctness: one source of truth; derived values (winner, margin, player stats) never typed twice.
- Performance and availability: public pages must not depend on a third-party site at request time.
- Legal: respect the provider's access controls and terms.
- Editor workflow: non-technical editors must be able to enter and correct results.

## Considered Options

1. **Store fixtures in Payload**; seed from data copied from CricClubs by a club member; editors maintain it afterwards.
2. Scrape CricClubs on a schedule.
3. Embed or link CricClubs pages instead of hosting results.

## Decision

Chosen option 1.

- Collections `teams`, `competitions` and `fixtures` (with innings and a result group) are the source of truth.
- For results decided on the field, winner and margin are **derived** from the innings (`resolveMatchResult` in `src/domain/cricket`). Only Duckworth–Lewis–Stern outcomes and forfeits are entered explicitly, because they cannot be recomputed from the scores alone.
- Teams are stored in batting order for completed matches, matching how the league lists them.
- Bulk imports are idempotent seed scripts (`pnpm db:seed`) keyed by `importKey`; they never overwrite records edited in the admin.

Option 2 bypasses the provider's access controls and breaks whenever their markup changes. Option 3 gives up bilingual content, SEO and the derived statistics the platform is built around.

## Consequences

- Good: pages are static and independent of CricClubs; results are validated (overs notation, wickets ≤ 10, batting teams belong to the fixture).
- Good: the same innings data will later feed scorecards and player statistics.
- Bad: results are entered twice across systems (CricClubs for the league, Payload for the website) until an official export or API exists. Revisit if the league offers one.
- Bad: opponent full names, venues and start times are not in the copied data; editors complete them in the admin.
