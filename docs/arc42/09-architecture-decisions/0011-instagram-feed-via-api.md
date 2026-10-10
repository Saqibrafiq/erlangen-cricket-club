# 0011. Instagram posts via the Instagram API, served without third-party requests

- Status: accepted
- Date: 2026-10-10

## Context

The old WordPress site showed the club's latest Instagram posts; the club wants the same on the new home page. Instagram's embed script loads from Meta's servers and sets cookies. In Germany that needs consent, and `CLAUDE.md` §10 rules out tracking cookies and a cookie banner. Instagram's old Basic Display API was shut down in December 2024; its replacement, the "Instagram API with Instagram Login", needs a Professional (Business or Creator) account and an access token that expires after 60 days unless renewed.

## Decision Drivers

- No cookies and no request to Meta from the visitor's browser (privacy by default, no banner).
- €0, no third-party feed service.
- Nothing for editors to maintain after the one-time setup; the home page must never break if Instagram is down.

## Considered Options

1. **Instagram API, fetched on the server**, images delivered through Next.js' image optimizer from our domain.
2. Instagram embed (`blockquote` + `embed.js`) behind a two-click consent, like the map (ADR-0008).
3. A third-party feed widget (e.g. Elfsight, SnapWidget).
4. No feed: Instagram link in the footer only.

## Decision

Chosen option 1, plus the footer link (option 4) on every page.

- `features/instagram/server/feed.ts` reads the token from the editor-only Payload global `instagram`, requests `/me/media` from `graph.instagram.com` (cached for an hour, like the home page) and validates the response with Zod.
- The token renews itself: when it is a week old, the server calls `refresh_access_token` and stores the new token. As long as the home page is rendered at least once every 60 days, the token never expires.
- Post images go through `next/image` (remote patterns `*.cdninstagram.com`, `*.fbcdn.net`): the optimizer fetches them server-side, so visitors only contact our domain until they click a post.
- Any failure is logged and hides the section; the rest of the page renders normally.

## Consequences

- Good: the feed looks native, loads fast and sets no cookies; no consent banner.
- Good: one-time setup by the club (Professional account, Meta app, token pasted in the admin), then hands-off.
- Bad: depends on Meta's API terms. If they change, the section disappears (it is optional) until the code is adapted.
- Bad: if the site is not rendered for 60 days, the token expires and must be pasted again (the admin field explains this).
- Follow-up: the privacy policy must mention that post images are loaded from Instagram by our server and that clicking a post leads to Instagram (TD-8).
