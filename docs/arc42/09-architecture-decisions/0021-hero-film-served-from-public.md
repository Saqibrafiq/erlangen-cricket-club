# 0021. Hero film served as a static file from `public/`

- Status: accepted
- Date: 2026-11-04

## Context

The club has an 8-second film for the home page: a drone flight over the ground that ends with the club crest drawing itself (1280×720 MP4, 4.3 MB). It plays behind the hero's heading and next-match card, and replaces the crest image there. The site must stay at €0 running cost (§2), keep the Core Web Vitals budget (§9) and respect reduced motion (§8.2).

## Decision Drivers

- No effect on LCP or CLS: the heading stays the largest element, and nothing shifts while the film loads.
- No download for visitors who asked for less motion or less data.
- The crest the film ends on is never cut, on any screen shape.
- €0: no video hosting service, no third-party player (no cookies, §10).

## Considered Options

1. **A static file in `public/videos/`, played by a plain `<video>` element.**
2. Upload it through Payload to Vercel Blob. The `media` collection accepts images only, so this would need a video upload type and admin UI for a single, rarely changed asset.
3. YouTube or Vimeo embed: sets cookies, loads a heavy player, and needs consent.

## Decision

Option 1.

- **Files:** `public/videos/hero.mp4`, plus two stills taken from it: `hero-start.jpg` (first frame, the poster until playback starts) and `hero-end.jpg` (the finished crest).
- **Loading:** the server renders the poster only. `HeroVideo` sets the source in the browser (`useSyncExternalStore`). Under reduced motion or data saver (`navigator.connection.saveData`), the film never loads and the finished crest shows as a still.
- **Playback:** muted, inline, plays once and stays on the crest. It is hidden from assistive technology as decoration.
- **Framing:** the film sits in the first screen below the header pill and is centred. It is sized as `min(200cqw, 177.78cqh)` in a size container, so it shows the full frame on landscape screens. On portrait phones it is just wide enough for the crest, cropping only the field at the sides. A blurred still fills the rest, and the film's edges fade into it (`video-edge-fade`).
- **Legibility:** the hero has fixed cinematic tokens in every theme (`on-video`: cream text on navy scrims). On the home page, the header lies on the film with its own light-on-dark tokens (`data-over-media`).

## Consequences

- Good: no new service or dependency. The film is served from Vercel's CDN with long caching.
- Good: visitors who opt out of motion or data download nothing; nobody downloads the film before the page is interactive.
- Bad: the repository carries a 4.3 MB binary. Replacing the film means a commit, not an edit in the admin. Acceptable for a single asset that rarely changes.
- Bad: each first visit to the home page costs about 4.4 MB of the Vercel Hobby bandwidth allowance (100 GB/month), roughly 20,000 such visits a month. Far above the club's traffic; revisit if that changes.
