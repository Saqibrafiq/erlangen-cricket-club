# 0001. Modular monolith with Next.js and Payload CMS

- Status: accepted
- Date: 2026-10-03

## Context

The platform needs a public website (SEO, performance, accessibility) and an admin where non-technical editors manage scorecards, players and stories. It is built and run by one developer, with a hard constraint of €0 running cost.

## Decision Drivers

- Team size of one: operational overhead must be minimal.
- €0 running cost: one free-tier deployment is preferable to several.
- Maintainability: clear module boundaries despite a single codebase.
- Data correctness: one source of truth (scorecards) with derived stats.
- Type safety from database to UI.

## Considered Options

1. **Modular monolith**: Next.js with Payload CMS 3 inside the same app, vertical feature slices.
2. Next.js frontend + headless SaaS CMS (e.g. Sanity, Contentful).
3. Next.js frontend + separate backend service (e.g. NestJS) + database.
4. Micro-frontends per feature.

## Decision

Chosen option 1: a **modular monolith** — Next.js App Router with Payload CMS 3 embedded, organised as vertical feature slices with a public `index.ts` per feature and layering enforced by dependency-cruiser.

- Payload runs in-process and is queried through its Local API: no network hop, full TypeScript types generated from collections.
- One deployment on Vercel, one PostgreSQL database on Neon.
- Option 2 adds a vendor dependency, free-tier limits on editors/records and a second data model. Option 3 doubles deployment and operational work for no benefit at this scale. Option 4 solves a multi-team problem that does not exist.

## Consequences

- Good: one repo, one deploy, one type system; the Local API keeps data access fast and typed.
- Good: module boundaries are checked in CI, so the monolith can be split later if ever needed.
- Bad: Payload's generated admin routes and root layout live in the app (`src/app/(payload)`) and constrain Next.js features (see ADR-0002).
- Bad: Payload's cold start adds to serverless function latency; mitigated by static rendering and ISR for public pages.
