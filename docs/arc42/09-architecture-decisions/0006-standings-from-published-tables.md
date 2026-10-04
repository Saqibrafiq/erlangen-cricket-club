# 0006. Standings show the league's published tables, entered in the CMS

- Status: accepted
- Date: 2026-10-04
- Deviates from: `CLAUDE.md` §4.1 ("standings are derived, never typed in twice")

## Context

Each competition needs a league table (MAT, WON, LOST, N/R, TIE, PTS, WIN %, NET RR, FOR, AGAINST). The leagues publish official tables on CricClubs, which cannot be read automatically ([ADR-0003](0003-own-match-data-in-payload.md)).

Deriving the table requires **every** league match, including the many matches without ECC (72 in the 2026 T20 1. Verbandsliga, of which ECC played 16). A first implementation did derive the table and reproduced ECC's published rows exactly, but other teams' rows were wrong because only ECC's matches are stored. The club owner decided against maintaining other clubs' results.

## Decision Drivers

- Correctness: the table must equal the official one, for every team.
- Editor effort: a non-technical editor; entering ~100 other clubs' scorecards per season is not realistic.
- KISS / YAGNI: no NRR rule engine to maintain for leagues whose conventions we do not control.

## Considered Options

1. **Store the published table per competition** (editor copies it from CricClubs).
2. Calculate from all league results (every match of every team entered).
3. Hybrid: calculate ECC's row from its fixtures, store the others.

## Decision

Chosen option 1.

- `competitions.standings` is an array of rows in published order (row 1 = position 1): team (relationship), MAT, WON, LOST, N/R, TIE, PTS, WIN %, NET RR, runs/overs for and against — every column exactly as published.
- The website renders the rows as stored, in the same column order, without sorting (the ranking is the content).
- A competition without rows shows "table not published yet".

Option 2 was implemented first and removed: correct only with complete data, which the club will not maintain. Option 3 would show one row computed differently from the rest of the table and could contradict the official ranking.

## Consequences

- Good: the table is the official one, for every team, the moment the editor saves it.
- Good: no dependency on other clubs' results or on CricClubs' unpublished NRR conventions.
- Bad: deliberate duplication — ECC's results exist as fixtures and again inside the table, and the two can drift if the editor forgets to update the table. Mitigation: the CMS description tells editors to copy the table after each round; E2E tests pin the seeded 2026 tables.
- Bad: player statistics and Hall of Fame will still be derived from scorecards (§4.1 stays in force for them); only standings are exempt.
