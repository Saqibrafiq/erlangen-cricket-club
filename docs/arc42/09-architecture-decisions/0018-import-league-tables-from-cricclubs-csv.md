# 0018. Update league tables from CricClubs CSV exports on the website

- Status: accepted
- Date: 2026-10-27

## Context

The 2026 season is over; for 2027 the standings must be updated every week. Until now an editor typed each table into Payload's admin, row by row, 12 numbers per team (ADR-0006). CricClubs has no public API, and ADR-0003 rules out scraping. CricClubs' points table page can, however, export the table as CSV ("viewPointsTableExcel.csv"), and the club already gets its tables from there.

## Decision Drivers

- A weekly update must take a minute, on the website, by a non-technical editor (persona 4).
- The published table must be correct: a wrong file must never replace a good table.
- No scraping, no API, no running cost.
- Tables stay owned in Payload (ADR-0003), and the admin keeps working.

## Considered Options

1. **Upload the CricClubs CSV export on the standings page, preview, confirm.**
2. Paste the table from the CricClubs page into a text box.
3. Keep typing tables into the admin.

## Decision

Option 1.

- **Parsing:** `features/standings/domain/standings-csv.ts` reads the export.
  - Columns are found by their header (CricClubs pads them with spaces), rows stay in published order.
  - Every bad cell is reported with its line and column, all at once.
- **Comparison:** `standings-diff.ts` compares the upload with the current table: moves, points and matches added, teams new to us, teams dropped.
- **Preview before saving:** the panel shows that comparison and then the table in the real `StandingsTable`. Nothing is saved before "Import table (N teams)"; an identical re-upload can't be imported.
- **Saving:** the server parses the CSV again.
  - It replaces the competition's whole table.
  - Teams not yet in our records are created from their CricClubs code, with the code as their name until an editor sets the full name.
- **New season:** "New competition…" (name, season, 20 or 50 overs) creates the competition in the same step. The season defaults to the year after the newest one we have.
- **Seasons:** the site shows the current (newest) season everywhere: standings, home page, import list. Older seasons move to `/standings/season/{year}`, linked from a season switcher on the standings page.
- **Shared code:** `shared/lib/csv.ts` (RFC 4180) and `shared/ui/FileDropZone` are shared, ready for the fixtures import.

## Consequences

- Good: a weekly update is export, drop, check, confirm. The table matches CricClubs exactly, with no typing.
- Good: a wrong file (another export, a broken edit in Excel) is caught before anything changes.
- Bad: an import replaces the whole table, so a correction made only on our side is overwritten by the next import. CricClubs is the source.
- Bad: new opponents first appear with their code as name (e.g. "SKCC") until an editor names them in the admin.
- Bad: if CricClubs renames a column, imports fail with "Column … is missing". They don't save wrong data, and the fix is one constant.
