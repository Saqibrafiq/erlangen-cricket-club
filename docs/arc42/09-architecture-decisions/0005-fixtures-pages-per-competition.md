# 0005. Fixtures: one page per competition, reached via a header dropdown

- Status: accepted
- Date: 2026-10-03

## Context

ECC fields several teams (ECC-I, ECC-II) in several competitions per season (2026: DCB-Bundesliga Südost, BCV T20 Regionalliga, BCV Regionalliga). A single results page grew to 33 match cards mixing 20- and 50-over formats and different teams, without shareable or indexable URLs per competition.

## Decision Drivers

- Usability for the primary persona (player on a phone): reach "my team's competition" in one or two taps; see the next match without knowing which competition it belongs to.
- Findability: each competition should be indexable on its own.
- Maintainability: new competitions each season must not require code changes.

## Considered Options

1. **Overview + one page per competition**, linked from a header dropdown grouped by team.
2. Header dropdown + competition pages only (no overview; `/fixtures` redirects).
3. One page with a competition selector (tabs/select).
4. One long page grouped by competition (previous state).

## Decision

Chosen option 1.

- `/fixtures` — **all fixtures of all competitions in one list** (upcoming first, then newest results), filterable by competition (select grouped by team), status category (upcoming, completed, abandoned, walkover, forfeit) and club result (won, lost). Option counts are faceted: each group counts matches for the other active filters.
- `/fixtures/[competition]` — one competition: record and its fixtures, filterable by status and result; breadcrumbs and `BreadcrumbList` JSON-LD. URL segment is the competition's `slug`.
- Filters live in the URL (`?competition=…&status=…&result=…`) so filtered views are shareable. Filtering runs in the browser over server-rendered cards, so pages stay static; the unfiltered list is the static HTML (crawlers, no-JS).
- The header "Fixtures & Results" item is a disclosure dropdown (button + links, opens on tap/click, Escape/outside-click/focus-out close it) listing the latest season's competitions grouped by club team.
- Which club team plays a competition is **derived** from its fixtures, not stored on the competition.
- Competition pages are statically generated; new competitions render on first request (`dynamicParams`) and all localised pages revalidate on CMS changes because the header lists competitions.

## Consequences

- Good: shareable, indexable competition URLs; short pages; next match visible without choosing a competition.
- Good: zero code changes for new seasons or competitions.
- Bad: the locale layout queries the database (header menu), so every page build depends on it and any match-data change revalidates every localised page. Acceptable at club scale; revisit with tag-based caching if the site grows.
- Bad: older seasons drop out of the dropdown; they stay reachable through the overview's competition filter.
- Bad: every fixture ships in the overview's HTML. Fine for a season (~50 fixtures); add a season filter or pagination when several seasons accumulate.

## Revision (2026-10-03)

The first version showed upcoming fixtures plus one card per competition on `/fixtures`. Feedback: "All" must mean all fixtures together, with filters. Competition cards were removed in favour of the combined, filterable list above.
