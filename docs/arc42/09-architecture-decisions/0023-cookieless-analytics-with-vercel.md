# 0023. Cookieless analytics with Vercel Web Analytics and Speed Insights

- Status: accepted
- Date: 2026-11-08

## Context

The site had no analytics. The privacy policy promised "no analytics or advertising services". The club wants to know which pages are read, and the Core Web Vitals budget (LCP < 2.5 s, INP < 200 ms, CLS < 0.1, `CLAUDE.md` §9) should be measured on real visitors, not only in the lab. `CLAUDE.md` §10 allows only cookieless analytics (no cookie banner) and asks for an ADR when this changes. Running cost must stay at €0.

## Decision Drivers

- No cookies and nothing stored on the visitor's device, so no consent banner (§ 25 TDDDG).
- No personal profiles; data minimisation under the GDPR.
- €0, and no extra provider to add to the privacy policy.
- Real-user performance data to back the Core Web Vitals budget.

## Considered Options

1. **Vercel Web Analytics and Speed Insights** (the host's own, free on Hobby).
2. Self-hosted Plausible or Umami: cookieless, but they need hosting (not €0) and maintenance.
3. Google Analytics: sets cookies and needs a consent banner; ruled out by §10.
4. No analytics: nothing to disclose, but no knowledge of what visitors use and no field data.

## Decision

Option 1. `<Analytics />` and `<SpeedInsights />` sit in the locale layout and only send data on Vercel deployments.

- **Analytics:** page, referrer, country, browser, OS and device type, as aggregated counts. Visits are told apart only by a hash of the request that is discarded after 24 hours. No IP address is stored.
- **Speed Insights:** Core Web Vitals per route and device type.
- **Privacy policy:** section 2 (EN/DE) now describes both tools, with the legal basis Art. 6 (1) (f) GDPR (legitimate interest). Vercel is already the disclosed host with a data processing agreement, so no new recipient is added.

## Consequences

- Good: visitor numbers and field Core Web Vitals at €0, still without a cookie banner.
- Good: one provider for hosting, analytics and performance data, so the privacy policy names no extra company.
- Bad: the privacy policy changed. The live text is edited in the admin (the seed only fills an empty page), so the new section has to be pasted in there.
- Neutral: both tools must be switched on once in the Vercel dashboard (Analytics, Speed Insights). Free-tier limits apply (risk R-1).
