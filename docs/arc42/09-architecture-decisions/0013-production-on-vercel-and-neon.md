# 0013. Production on Vercel and Neon (Frankfurt); migrations in the build, no preview deployments yet

- Status: accepted
- Date: 2026-10-11

## Context

The site goes live. `CLAUDE.md` §3 fixes the platforms (Vercel Hobby, Neon, Vercel Blob) and §2 the €0 budget. Three questions remained open:

1. **When migrations run.** Pages are prerendered from the database at build time, so the schema must be current _before_ `next build`. Payload's `prodMigrations` only runs when the server starts, which is after the build.
2. **Preview deployments.** Vercel builds every branch by default. With the build migrating the database, a preview of an unmerged branch would apply its migrations to the production database.
3. **Region and canonical URL.** Neon's free tier offers Frankfurt (`aws-eu-central-1`); the functions must sit next to it. Canonicals, sitemap and hreflang need the production origin, which is a `*.vercel.app` address until a domain is bought.

## Decision Drivers

- €0; EU data residency (GDPR); low latency between functions and database.
- A deployment can never leave the database and the code out of step.
- No unmerged code ever touches production data.
- No manual steps an editor or a future maintainer could forget.

## Considered Options

- Migrations: **(a) `pnpm db:migrate && pnpm build` as Vercel's build command**; (b) a GitHub Actions job that migrates before Vercel deploys; (c) only `prodMigrations` on startup.
- Previews: **(a) off until each preview gets its own Neon branch**; (b) previews against the production database; (c) previews against one shared staging database.

## Decision

- `vercel.json`:
  - build command `pnpm db:migrate && pnpm build`;
  - `ignoreCommand` skips every non-production build;
  - functions in `fra1` (Frankfurt), next to the Neon database in `aws-eu-central-1`.
- Vercel's Git integration deploys `main`. CI on pull requests is the gate: branch protection requires green CI before merging.
- `prodMigrations` stays as a second line of defence, e.g. after a rollback to an older deployment.
- `siteConfig.url` falls back to Vercel's `NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL` when `NEXT_PUBLIC_SITE_URL` is unset. Canonicals then follow the production domain automatically: `*.vercel.app` first, the custom domain once it is assigned.
- `DATABASE_URI` is Neon's pooled connection string, because serverless functions open many short connections.
- The step-by-step setup lives in [`docs/deployment.md`](../../deployment.md).

## Consequences

- Good: schema and code always ship together, and a failing migration fails the deployment instead of the live site.
- Good: production data is only touched by code merged into `main`.
- Bad: no preview URL for pull requests; UI changes are reviewed through screenshots and Storybook. Follow-up: Neon branch per preview via the Neon–Vercel integration.
- Bad: a migration that is not backwards compatible briefly breaks the old deployment between the migration and the switch to the new one. Migrations stay additive (expand, then contract in a later release).
- Risk: Vercel Hobby is for non-commercial use. A non-profit club site fits, but showing sponsors could be read as commercial. Fallback: Vercel Pro (paid, needs an ADR), or move the Next.js app to another host (Netlify, Cloudflare) while keeping Neon and Payload.
