# 0019. Import fixtures from a club CSV template, with saved grounds

- Status: accepted
- Date: 2026-11-03

## Context

For 2027 the whole season's fixtures must go on the website, with where each match is played. The leagues send their schedules as PowerPoint, Word or PDF, not as data. CricClubs has no API and we don't scrape (ADR-0003). Until now fixtures were seeded or entered one by one in the admin, and the venue was free text that nobody filled in.

## Decision Drivers

- One upload per competition and season, made by a non-technical editor (persona 4).
- Players on the way to a match need the ground and directions (persona 1).
- Results are entered later; an import must never overwrite them.
- A schedule changes during the season (rescheduled matches): uploading it again must update it, not duplicate it.

## Considered Options

1. **The club's own CSV template, filled in from the league PDF in Excel, uploaded with a preview.**
2. Parsing the PDFs directly.
3. Keep entering fixtures one by one in the admin.

## Decision

Option 1. PDF layouts differ per league and year, so parsing them would break silently.

- **Template:** downloadable from the import panel (`FIXTURES_CSV_TEMPLATE`), with only what a league schedule says: Date, Time, Home, Away.
  - Optional extra columns Ground, Address and Stage cover exceptions (e.g. a neutral final).
  - Dates are read as written in Excel (`16.05.2027`, `16/05/2027`, `2027-05-16`), and so are times (`11:00`, `11:00:00`).
  - Teams are their codes, as in the standings (`ECC-I`).
- **Grounds:** a `grounds` collection (name, address) replaces the fixture's free-text `venue`. The migration moves any existing venue text into grounds.
  - The import creates grounds it doesn't know.
  - An address in the file fills in a ground without one, but never overwrites an address someone saved.
  - Fixtures show the ground; "Directions" links to Google Maps (a link only, nothing is loaded from Google).
- **Home grounds:** leagues publish home and away teams, not grounds. Each ground has an optional club code (`ECC`, `NCC`, …), and a fixture without a Ground is played at the home club's ground (`ECC-II` → `ECC` → Erlangen Cricket Ground). A Ground in the file wins (e.g. a neutral final). The preview marks these as "home ground".
  - A migration loads the 45 grounds of the Bayerischer Cricket Verband (from its CricClubs grounds list, supplied by the club) with their club codes, so production has them too. For Erlangen it uses the pitch (Siedlerstraße 1) instead of the club's postal address that CricClubs lists.
- **Matching across uploads:** an imported fixture's `importKey` is `csv-{competition}-{home}|{away}|{n}`, where n counts how often the pair meets.
  - A match moved to another day keeps its key, so a re-upload shows it as "Changed: date".
  - Upcoming imported fixtures that are no longer in the file are removed.
  - Played, abandoned or cancelled fixtures, and anything entered in the admin, are never changed or removed.
- **Preview and confirm, as for standings (ADR-0018):** the server parses and compares again.
- **Editing on the website:** in edit mode every fixture card has edit and delete buttons. Editors can change the date, time, ground (from the saved grounds), stage and, before it is played, the status: scheduled, cancelled, abandoned. Results stay in the admin. Deleting asks first and dissolves the card (shared `Vanish`).
- **Seasons:** the fixtures page shows the current season, the newest one with a competition. Past seasons are at `/fixtures/season/{year}`, linked from the season switcher.
- **Competitions:** choosing or starting a competition moved into a small `features/competitions` slice, used by both imports. It holds the target form, `CompetitionTargetFields`, `resolveCompetition` and `resolveTeams`.

## Consequences

- Good: a season's schedule goes online in one step, with grounds and directions, and can be corrected by uploading the file again.
- Good: results are safe from imports by design.
- Bad: someone has to type the schedule into Excel once per competition (dates and teams; grounds come from the home team).
- Bad: a club new to the league has no ground until an editor adds it (with its club code) in the admin; until then its home fixtures show no ground.
- Bad: renaming a team code in the file makes its fixtures look new (the old ones are removed and the new ones added), which the preview shows.
