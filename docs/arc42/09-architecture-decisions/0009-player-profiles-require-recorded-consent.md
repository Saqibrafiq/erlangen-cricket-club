# 0009. Player profiles require recorded consent

- Status: accepted
- Date: 2026-10-09

## Context

The players page publishes personal data: name, photo and, later, match stats. Under GDPR (Art. 6 and 7) the club needs a legal basis for that and must be able to show that a player agreed. `CLAUDE.md` §10 requires a recorded consent flag on the player record. Players may also ask to be removed at any time. The first 17 players come from the old website's "ECC TEAM" page; the board confirmed on 9 October 2026 that they agreed to appear.

## Decision Drivers

- Nothing about a player is public unless consent is recorded, even if a query forgets the rule.
- Consent can be traced: who agreed, how and when.
- Removing a player is a single action for a non-technical editor and takes effect immediately.
- Squad lists stay simple; no separate consent store or workflow.

## Considered Options

1. **Consent fields on the player record, enforced twice**: by collection read access and by explicit filters in the public queries.
2. Payload drafts (publish/unpublish) as the consent switch.
3. A separate consent collection linked to players.

## Decision

Chosen option 1.

- `players` has `hasPublishConsent` (checkbox, default off) and `consentNote` ("how consent was given"), which is required once the box is ticked. The note's field access is limited to signed-in editors, so it never leaves the admin.
- Collection read access (`consentedOrSignedIn`) limits visitors of the REST API to players with consent. The site reads through the Local API, which bypasses access control, so `features/players/server/queries.ts` filters on `hasPublishConsent` explicitly. This is the same pattern as drafts in `news`.
- Unticking the box revalidates all pages (the existing `afterChange` hook), so the player disappears from the squad, the profile (404), the sitemap and the JSON-LD at once.
- Drafts (option 2) were rejected because "published" means "editorially ready", not "the person agreed", and an editor could publish without thinking about consent. A separate collection (option 3) adds joins and admin screens without adding information at club scale.

## Consequences

- Good: two independent guards; tests and E2E cover the public behaviour.
- Good: the consent record lives next to the data it covers, which makes it easy to audit.
- Bad: an uploaded photo stays reachable at its media URL until the editor deletes it. Removing a player on request therefore means unticking consent and deleting the photo; the admin field description says so.
- Follow-up: the privacy policy (edited in the admin) must describe the player profiles and how to ask for removal.
