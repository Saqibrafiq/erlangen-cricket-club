# 0025. Keep personal images in the database, not in public Blob storage

- Status: accepted
- Date: 2026-11-19

## Context

The members' app shows a captain the Spielerpass cards of an approved squad on match day, and the captain uploads a photo of the signed DCB match report sheet after the match (app ADR-0007, UC-13, UC-22). Both are personal data: a Spielerpass shows a player's photo and personal details; the signed sheet carries names, pass numbers and signatures.

Uploads on this website go to Vercel Blob through `@payloadcms/storage-vercel-blob`, which only supports public files: anyone who has a file's address can open it. That is fine for news photos, not for passes. The project runs at €0.

## Decision Drivers

- No public address for personal images, ever (GDPR, Art. 5 (1)(f) and 32).
- The same access rules as the records they belong to: the Board for cards; the Board and that team's captain for signed sheets.
- €0 and no new service.
- Small volume: about 40 cards and one sheet per match, each a phone photo.

## Considered Options

1. **Store the bytes in Postgres** through a small storage adapter for Payload's cloud-storage plugin; Payload's access-checked file route serves them.
2. Vercel Blob with a long random file name, fetched only by the app server, so the address never reaches a browser.
3. A private object store (S3, R2) with signed URLs.

## Decision

Option 1.

- `cms/storage/database-storage.ts` is a Payload storage adapter: an upload's bytes are written to the hidden `stored-files` collection (base64, keyed by collection and file name), deleted with the upload, and served by Payload's file route, which checks the upload collection's read access first. Responses are `Cache-Control: private, no-store`.
- `stored-files` is not reachable over the API, not even for admins, and hidden in the admin panel; only the adapter uses it, through the Local API.
- `spielerpass-cards` (read and write: admins) and `match-sheets` (read: admins and the team's captain; created by the team's captain) use the adapter. Images are scaled to at most 1600 px and stored as JPEG to keep the database small.
- Option 2 keeps a public file behind an unguessable name: one leaked address exposes a pass, and a leak cannot be undone. Option 3 adds a service and an account outside the €0 stack.

## Consequences

- Good: personal images never leave the club's database and follow the same access rules as their records; deleting a card deletes its bytes.
- Good: backups of the database include the images; nothing to sync between two stores.
- Bad: the database grows by the images (about 40 cards and a season of sheets at roughly 200–400 KB each: tens of MB, well within Neon's free 0.5 GB). Base64 adds a third. If volume grows, revisit with option 3.
- Bad: every image request goes through the website's server instead of a CDN. Acceptable for a few views per match day.
