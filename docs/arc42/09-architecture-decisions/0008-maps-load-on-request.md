# 0008. Maps load on request (OpenStreetMap, two-click)

- Status: accepted
- Date: 2026-10-07

## Context

The contact page should show where the ground is on an interactive map. Embedding a third-party map loads it from the provider's servers as soon as the page opens, which sends every visitor's IP address (and possibly cookies) to that provider before they have agreed to anything. In Germany this requires consent; `CLAUDE.md` §10 rules out tracking cookies and a consent banner.

## Decision Drivers

- Privacy by default: nothing reaches a third party unless the visitor asks for it.
- €0, no API key or account.
- A real, interactive map for visitors who want it; a quick route to their own maps app for the rest.

## Considered Options

1. **Two-click OpenStreetMap embed**: a placeholder with a "Show map" button; the iframe loads after the click.
2. Google Maps embed, loaded immediately (needs consent; Google sets cookies).
3. Static map image generated from map tiles (no interaction; licence attribution and tile-usage rules to follow on every change of the ground).
4. No map, only an "Open in maps" link.

## Decision

Chosen option 1, plus an "Open in maps" link (option 4) for directions in the visitor's own app.

- The ground's latitude and longitude are stored in the `contact` global; `domain/map.ts` builds the embed URL, a larger-map link and the Google Maps directions link from them.
- The placeholder explains in one sentence that loading the map sends the IP address to the OpenStreetMap Foundation. The iframe uses `referrerPolicy="no-referrer"` and `loading="lazy"`.
- OpenStreetMap's embed sets no tracking cookies and needs no key.

## Consequences

- Good: no data leaves the site until the visitor clicks; no consent banner needed; €0.
- Good: one source of truth for the position (coordinates), so the map and the link always agree.
- Bad: one extra click to see the map. The address, directions and "Open in maps" are visible without it.
- Follow-up: the privacy policy (edited in the admin) must mention the optional OpenStreetMap embed.
