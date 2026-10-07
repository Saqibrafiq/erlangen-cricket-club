# 0007. Contact messages are stored in the CMS, protected by a honeypot

- Status: accepted
- Date: 2026-10-07

## Context

Visitors — above all prospective members (persona 2: often new to Germany or to cricket here), but also sponsors and other clubs — need one clear way to reach the board. The old site had a contact form and a PDF application form. Constraints: €0 running cost, no tracking cookies (no consent banner), GDPR data minimisation (`CLAUDE.md` §10), no third-party captcha that sets cookies.

The membership page explains fees, training and how to join; it links to a separate contact page for questions, so the membership page stays focused on persuading and the contact page serves every topic.

## Decision Drivers

- Low barrier for visitors; a reply from the board within days.
- Privacy: collect only what the board needs to reply; personal data visible to signed-in editors only.
- €0 and no new external service or account.
- Spam resistance without cookies or third-party scripts.

## Considered Options

1. **Store messages in a Payload collection**; the board checks the admin.
2. Send messages by email through a transactional provider (e.g. Resend free tier).
3. Only a `mailto:` link.

## Decision

Chosen option 1, with the club's email address shown next to the form.

- Form fields: name, email, topic (membership, sponsorship, matches, other) and message (max. 1000 characters). Nothing else (no phone, address or birth date — those stay on the paper application form).
- `submitContactMessageAction` (server action) validates with Zod and writes to `contact-messages` with `overrideAccess`. The collection's own access forbids creation through the API; reading, updating and deleting require a signed-in editor. Each message has a status (new, replied, closed).
- Spam: a hidden honeypot field. Submissions that fill it get the normal success response but are not stored. No captcha, no cookies, no third-party script.
- The form explains the purpose in one sentence and links the privacy policy (legal basis: answering the request, including steps prior to membership, Art. 6(1)(b) and (f) GDPR — no consent checkbox needed).

## Consequences

- Good: €0, no external processor to list in the privacy policy, personal data stays in the club's own database.
- Good: the board gets a simple inbox with a status per message, filterable by topic.
- Bad: no notification — messages can go unnoticed if nobody checks the admin. Mitigation: board routine; add email notification (option 2, with an ADR update and privacy policy entry) if response times suffer.
- Bad: a honeypot stops simple bots only. Add rate limiting or a privacy-friendly challenge if spam appears.
- Follow-up: the privacy policy (edited in the admin) must describe the contact form, and messages should be deleted when no longer needed (e.g. once closed or after 12 months).
