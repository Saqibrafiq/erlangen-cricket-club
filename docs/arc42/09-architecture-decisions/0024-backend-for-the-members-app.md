# 0024. The website's CMS is also the backend of the members' app; roles separate the Board from members

- Status: accepted
- Date: 2026-11-08

## Context

The club is building a members' app (an installable web app, separate repository [Saqibrafiq/ecc-app](https://github.com/Saqibrafiq/ecc-app)) for match and practice availability, practice attendance, squad selection and Spielerpasses. Its ADR-0002 makes this website's Payload CMS and Neon database the single system of record, so fixtures, teams and players are entered once.

Until now every account was a website editor, and Payload's default access let any signed-in account write everything. With about 44 members receiving accounts for the app, that default would let any member edit the website.

## Decision Drivers

- One source of truth for fixtures, teams and players.
- Least privilege: members must not be able to edit the website or each other's data.
- €0: no second database or backend.
- No disruption for today's editors.

## Considered Options

1. **Extend this Payload**: roles on accounts, admin-only website editing, and the app's collections with access rules in the database.
2. A separate backend for the app, syncing fixtures and players from here.
3. Keep "signed in = editor" and rely on the app to never expose website editing.

## Decision

Option 1.

- **Roles** on `users`: `player` (default), `captain` (with `captainOf`, one club team) and `admin` (the Board). `role`, `player` and `captainOf` are set by admins only and travel in the session token. The first account ever created becomes admin; the migration makes every existing account admin, so today's editors keep their rights.
- **Website editing is admin-only**: every website collection and global allows create, update and delete to admins; drafts, contact messages, the Instagram settings and the consent note are readable by admins only; the Payload admin panel opens for admins only; edit mode is set for admins only, and the editing actions share one `getEditor` that requires the admin role. Signed-in members may read every player (the app lists squads); visitors still see only players with recorded consent (ADR-0009).
- **The app's collections** (group "Members' app" in the admin): `practice-sessions`, `availability-responses`, `attendance`, `squads`, `spielerpasses` (registered name and pass number; the card image follows with its own decision on private storage), `push-subscriptions`, `notification-log`. Players gain `squadTeam` (the one squad they belong to in the app) and `isEcc1Eligible` (motion 2024/06).
- **Access in the database**, not only in the app (`cms/access/members-app.ts`): a member writes only their own answers; who is going is visible to all members (motion 2026/06), the reason only to the member, their captain and admins; a captain records attendance and edits the squad of their own team only, and may only submit it: approving, returning and reopening are the Board's, and once submitted the squad is the Board's until they reopen it, apart from no-shows (`cms/hooks/guard-squad-changes.ts`); approved squads are visible to all, drafts to their captain and the Board; Spielerpasses and the notification log to admins only.
- **Teams are derived, never trusted**: a hook sets the ECC team of an answer, attendance record or squad from its fixture or practice and refuses a request that names another team.
- **API keys** are enabled on `users`, so the app's scheduled jobs run as a dedicated admin service account.

## Consequences

- Good: fixtures, teams and players stay in one place; the Board manages the app in the admin it already knows.
- Good: least privilege is enforced by Payload for every client, whether the website, the app or the REST API.
- Good: the six copies of `getEditor` in the website's editing features became one shared function.
- Bad: two repositories change together when the app needs new data. Mitigation: collections are added here first, with a migration and tests; the app validates every response.
- Bad: the website's database now also holds members' availability and attendance. Mitigation: access rules above, data minimisation (short reasons), and the privacy policy is extended before the app launches.
- Neutral: a member who signs in on the website sees it as a visitor does; their account is for the app.
