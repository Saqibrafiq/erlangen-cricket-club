# 0026. Serve the derived match result as a read-only virtual field

- Status: accepted
- Date: 2026-11-23

## Context

The members' app gets a season screen (app UC-23): every ECC match of the year with its result, such as "Won by 4 wickets" or "Lost by walkover". This website already derives results: `resolveMatchResult` (`domain/cricket`) works out the winner and margin from the two innings, or takes the published winner and margin for DLS, forfeits and walkovers. Results are never typed in (CLAUDE.md §4.1).

The app reads fixtures over Payload REST (ADR-0024). The stored fixture holds the inputs (innings, result method, published winner), not the result itself.

## Decision Drivers

- One implementation of the cricket rules. If the website and the app disagree about a result, both lose credibility.
- Results stay derived, never stored twice: no copy to go stale when a scorecard is corrected.
- The app stays a BFF without domain knowledge of cricket scoring (app ADR-0002).
- €0, no new service, and no data migration.

## Considered Options

1. **A read-only virtual field on fixtures**, computed on every read from the stored inputs with the same `resolveMatchResult` the website's pages use.
2. Copy `resolveMatchResult` into the app and derive results there from the raw innings.
3. Store the result in a real column, written by a `beforeChange` hook.
4. A custom REST endpoint returning season results.

## Decision

Option 1.

- `matchResult` is a `json` field with `virtual: true` and an `afterRead` hook: no database column and no migration (`migrate:create --skip-empty` creates nothing). It is hidden in the admin panel, so editors only ever enter the inputs.
- The mapping from a stored fixture to `ResultInput` moved from `features/fixtures/server/map-fixture.ts` to `cms/fields/fixture-result.ts` (`getFixtureResult`). The website's fixture pages and the virtual field call it, so both always state the same result.
- The value is the `MatchResult` union from `domain/cricket` (win with margin, tie, forfeit, walkover, no result) or `null` until the fixture is completed. The app reads it from the club team's side and words it in its own messages.
- Option 2 creates two implementations of the scoring rules in two repositories, and they would drift. Option 3 stores derived data and needs a backfill and a migration; a corrected scorecard is only right if the hook ran. Option 4 adds an endpoint and its access rules for something the fixtures API already serves.

## Consequences

- Good: one source of truth for results across the website, its Instagram graphics and the app.
- Good: correcting a scorecard corrects the result everywhere on the next read; nothing to recompute or backfill.
- Neutral: the result is computed on every fixture read. It is a few comparisons per fixture, negligible next to the query.
- Bad: a completed fixture stored without valid innings makes reads of that fixture throw. The fixture's validation prevents this, and the website's pages already behaved the same way before.
- Neutral: `select` queries must include `status`, `innings` and `result` for the value to be computed; the app reads whole documents.
