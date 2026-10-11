# 0015. Edit content on the website itself; static pages stay static

- Status: accepted
- Date: 2026-10-12

## Context

The club's editors found Payload's admin too complicated and asked to add, edit and delete content directly on the website: "+ Add" and edit/delete buttons on the pages they already know. Players come first; news, fixtures and sponsors follow the same pattern.

The public pages are prerendered (static or ISR) for speed and the Core Web Vitals budget (`CLAUDE.md` §9). Knowing on the server who is viewing a page would mean reading cookies, which makes every page render per request for every visitor.

## Decision Drivers

- Editors work where they read: on the website, in the club's design, in English or German.
- Visitors keep fast static pages and download no editing code.
- Security must not depend on what the browser shows.
- One pattern that the next content types can reuse.

## Considered Options

1. **Controls on the pages, switched on in the browser** by a readable edit-mode hint cookie; changes go through server actions that check the session.
2. Read the session on the server and render pages per request for everyone.
3. A separate dashboard (`/dashboard`) with lists and forms.
4. Simplify Payload's admin instead.

## Decision

Chosen option 1.

- **Sign-in** (ADR-0014):
  - sets Payload's `HttpOnly` session cookie and a readable hint cookie `ecc-editor=1` with the same lifetime;
  - then loads the requested page in full; sign-out removes both.
- **Static pages stay static.**
  - `useIsEditMode` reads the hint in the browser and is false on the server and during hydration.
  - Editing controls load through `next/dynamic` only when it is true.
  - A slim admin bar under the header shows that edit mode is on.
- **The hint grants nothing.**
  - Each server action (`features/players/server/actions.ts`) checks the session with `payload.auth` and writes as that user with `overrideAccess: false`.
  - It validates everything with Zod (`parsePlayerForm`).
  - A faked cookie only reveals buttons that fail.
- **Composition.**
  - Routes pass the actions to the views as props (`PLAYER_EDITING`), so the components stay testable and Storybook never bundles server code.
  - Generic building blocks live in `shared/ui`: `Sheet` (side panel) and `ConfirmDialog`.
- **Fresh content.**
  - Collection hooks revalidate the localized layout.
  - The editor's view refreshes before the panel closes and the change is announced, so the list never lags behind the message.
- **Players.**
  - Add, edit and delete: photo (shrunk to WebP in the browser), name, role, bowling and batting style, teams, office, introduction, home page line-up and recorded consent.
  - Players without consent stay hidden from visitors but are listed for editors.
  - Bowlers are labelled by their style ("Fast bowler", "Medium pacer", "Spinner").
  - Deleting a player also deletes their photo.

## Consequences

- Good: editors manage the squad without learning the admin; visitors' pages are unchanged in speed and markup.
- Good: one secure pattern (hint cookie, then a dynamic island, then an authorised server action) for news, fixtures and sponsors.
- Bad: edit mode depends on a cookie that can outlive a session ended in the admin. The buttons then show "Your session has ended" with a link to sign in again.
- Bad: two editing UIs exist. Payload's admin remains for rare tasks (legal pages, settings, users).
- Lesson: `revalidatePath` needs the route group (`/(frontend)/[locale]`). Without it, edits never reached the prerendered pages in production. That has been fixed for all CMS changes.
