# 0022. Career stats from the league's season records

- Status: accepted
- Date: 2026-11-05

## Context

`CLAUDE.md` §4.1 makes match scorecards the single source of truth: player stats are derived from them and never typed in twice. The club has no scorecards for 2025 and 2026. Most ECC scorecards on CricClubs are hidden (captains' match reports are pending), so per-innings data cannot be had. What the club does have are the league's season records for every ECC player: totals per season and format (T20 leagues, 50-over leagues, all matches incl. friendlies), as the club president compiled them from CricClubs into a workbook. The profile's "Career stats" section has been an empty placeholder since the players feature shipped (TD-10).

## Decision Drivers

- Correct numbers on the profiles now, not once scorecards exist.
- Rates (average, strike rate, economy) must be consistent and calculated one way, whatever the source.
- Editors (non-technical) must be able to add next season's records without a developer.
- The step to scorecards later must not be blocked.
- CricClubs is never scraped (ADR-0003).

## Considered Options

1. **Store the league's season records (counts per player, season, competition, format) and calculate everything else from them.**
2. Wait for scorecards: profiles stay empty for at least another season.
3. Type season averages and strike rates into the CMS as published: rates rounded twice, and career rates cannot be added up.

## Decision

Option 1. This is a deliberate exception to "scorecards are the single source of truth", limited to seasons the club has no scorecards for.

- **Model:** a `player-seasons` collection with one record per player, season, competition, format and team (a unique index). It stores only counts as published: matches, innings, not outs, runs, balls, highest score, 50s and 100s, overs (cricket notation), maidens, runs conceded, wickets, best figures, hauls, dot balls, extras.
- **Competition:**
  - `club` records are for the ECC teams.
  - `district` records are for the Bezirk League district team. They are shown apart and kept out of the club totals, as the league's notes say.
- **Format:**
  - `all` counts every match, friendlies included. Career totals and the headline figures add these up.
  - `t20` and `fifty-over` are its league parts, shown when the visitor switches format. They need not add up to `all`.
  - `league` is one team's league matches (T20 and 50-over together), with the team set. These are the workbook's "By Team" figures.
- **Teams:** each season row opens a dropdown (all-matches view) listing the following. No "main team" is picked.
  - Every team's own figures (ECC I, II, III).
  - "Friendlies & other": the season total less the teams' league records, computed in `domain/cricket` (`subtractBattingTotals`, `subtractBowlingTotals`). It shows only when an innings is left. Its highest score and best figures are unknown, so they show as "–".
  - The district-team record for that year.
- **Squad teams:** imported players join ECC I and/or ECC II, whichever they played for, or ECC II otherwise. ECC III exists only in the stats.
- **Calculated, never stored:** batting average, strike rate, bowling average, economy, bowling strike rate, and the career totals. These are pure functions in `domain/cricket` with 100% branch coverage.
- **Loading:**
  - `pnpm db:import:player-seasons` loads the 2025/2026 records from `src/cms/seed/data/player-seasons-2025-2026.json`, converted once from the president's workbook.
  - It can be run again safely: it updates records by their key and matches site players under shorter names through an alias table.
  - It adds the ECC players the site did not list yet, with consent recorded as given by the president (§10; he decides for the club). It also adds the ECC III team.
- **Editing:** signed-in editors add, edit and delete season records on the profile itself (edit mode). The form is validated with Zod and refuses a second record for the same key.
- **Deleting a player** deletes their season records first (`beforeDelete` hook), as a record without its player cannot be shown.

## Consequences

- Good: every ECC player with league records has real career stats on their profile today, in English and German.
- Good: rates are calculated one way from counts, so seasons add up correctly into a career.
- Good: next season needs no developer. Editors add records in edit mode, or a new data file goes through the same import.
- Bad: two sources of stats will exist once scorecards are recorded. When that happens, scorecards replace season records for the seasons they cover; records stay only for seasons without scorecards. That will need another ADR.
- Bad: 30s and three-wicket hauls cannot be shown, as the league records do not include them.
- Neutral: 32 players were added with consent recorded at the president's instruction. Removing a player who objects is the usual edit (untick consent or delete).
