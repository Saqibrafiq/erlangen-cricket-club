# 0014. Club sign-in page on top of Payload's authentication

- Status: accepted
- Date: 2026-10-11

## Context

Editors (the board) need a way into the admin from the website. Payload already provides secure authentication:

- password hashing;
- session tokens;
- lockout after repeated wrong passwords;
- no public sign-up: after the first account, only signed-in users can create accounts.

Its login page, however, looks like a separate app and is English only. The president asked for a sign-in icon in the header and a sign-in page in the club's design.

## Decision Drivers

- Security must not be weakened: no second, home-made authentication system.
- Public pages stay static (Core Web Vitals budget, `CLAUDE.md` §9).
- The page is bilingual and accessible like the rest of the site (WCAG 2.2 AA).
- Little code to maintain (team of one).

## Considered Options

1. **Own sign-in page that calls Payload's Local API** (`payload.login`) and sets Payload's session cookie.
2. A header link straight to Payload's `/admin/login`, restyled with the crest.
3. An own admin dashboard on the website, replacing Payload's admin.

## Decision

Chosen option 1.

- `features/auth`:
  - `signInAction` validates the input with Zod, calls `payload.login`, and sets the `payload-token` cookie with the name, lifetime and flags that Payload's admin reads;
  - `isSignedIn` lets `/login` send a signed-in editor straight on.
- The users collection sets the session cookie to `Secure` in production. Payload's default is `false`.
- `?redirect=` only accepts paths on this site (`getSafeRedirectPath`), so the login can't be used as an open redirect. (Admin paths only at first; widened by ADR-0015.)
- While no account exists, `/login` sends visitors on to Payload's `/admin/create-first-user`. Payload's own login page did this check, and it is no longer reached.
- `next.config.ts` forwards `/admin/login`, including its query, to `/login`. Signed-out editors and sign-outs therefore always land on the club page.
- The header shows a small, named icon (`Admin login`) that always links to `/login`. It doesn't change when someone is signed in: showing that would mean reading the cookie in the root layout, which makes every public page dynamic.
- E2E: the seed creates a test admin only when `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` are set. Only CI's throwaway database sets them.

## Consequences

- Good: Payload's audited authentication is unchanged (hashing, tokens, lockout), and editors get a branded, bilingual and accessible entry point.
- Good: public pages stay static; only `/login` renders per request.
- Bad: two login implementations exist side by side. Payload's own page is unreachable, but `/admin/create-first-user` and password changes still use Payload's UI.
- Bad: the header doesn't show a signed-in state. Superseded in part by [ADR-0015](0015-edit-content-on-the-website.md): editors now land on the website in edit mode, with an admin bar for signing out.
- Follow-up: "Forgot password" needs an email adapter. Until one exists, an admin resets passwords in the admin.
