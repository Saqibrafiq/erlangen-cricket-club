# Deployment

How the site goes live, and how it stays live. The reasons are in [ADR-0013](arc42/09-architecture-decisions/0013-production-on-vercel-and-neon.md); the deployment view is in [arc42 §7](arc42/07-deployment-view.md).

Everything here uses free tiers; no credit card is needed.

## 1. Database: Neon

1. Sign up at [neon.tech](https://neon.tech) with GitHub.
2. Create a project:
   - name `erlangen-cricket-club`;
   - Postgres 17;
   - region **AWS Europe Central 1 (Frankfurt)**.
3. Copy the **pooled** connection string (Connect → "Connection pooling" on). The host contains `-pooler` and the string ends in `?sslmode=require`.

## 2. Media: Vercel Blob and the project

1. Sign up at [vercel.com](https://vercel.com) with GitHub (Hobby plan).
2. **Add New → Project**, import `Saqibrafiq/erlangen-cricket-club`. `vercel.json` already sets the framework, install and build commands, and the region. Don't deploy yet: the first build fails without the variables from step 3.
3. **Storage → Create → Blob**, name it `ecc-media`, access **Public**, no custom variable prefix, connect it to the project. The connection only adds `BLOB_STORE_ID`; copy the `vercel_blob_rw_…` token from the store page (.env.local tab) for step 3.
4. **Settings → Functions → Function Region:** check that it shows Frankfurt (`fra1`).

## 3. Environment variables (Project → Settings → Environments → Production → Environment Variables)

| Variable                       | Value                                                   |
| ------------------------------ | ------------------------------------------------------- |
| `DATABASE_URI`                 | Neon pooled connection string                           |
| `PAYLOAD_SECRET`               | `openssl rand -hex 32` (new value, never the local one) |
| `BLOB_READ_WRITE_TOKEN`        | the store token from step 2 (add it by hand, Secret)    |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1`, so Vercel uses the pnpm version in `package.json`  |

Leave `NEXT_PUBLIC_SITE_URL` unset: the site uses the production domain automatically. Set it only to force a specific origin.

## 4. Fill the database once (from your machine)

The seed imports the 2026 results, standings, news, players and photos, and the privacy policy. It writes the Impressum only once `CLUB_REGISTER_NUMBER` in `src/cms/seed/data/legal.ts` is set. It is idempotent: running it again changes nothing an editor has edited.

```sh
# PowerShell; the variables only live in this terminal.
$env:DATABASE_URI = '<Neon pooled connection string>'
$env:PAYLOAD_SECRET = '<the production secret>'
$env:BLOB_READ_WRITE_TOKEN = '<the Blob token>'
# Local uploads would make Payload rename every file it sends to Blob; the seed refuses to run.
New-Item -ItemType Directory -Force ..\ecc-uploads-backup
Move-Item media, documents ..\ecc-uploads-backup\ -ErrorAction SilentlyContinue
pnpm db:migrate
pnpm db:seed
Move-Item ..\ecc-uploads-backup\* .
```

Close the terminal afterwards, so later commands don't hit production. Don't delete anything in the Blob store while the seed runs: the database would point at missing files.

## 5. First deployment

1. Vercel → **Deployments → Redeploy** (or push to `main`). The build runs `pnpm db:migrate && pnpm build`.
2. Open `https://<project>.vercel.app/admin`. The first visit asks you to create the first admin user: use a strong, unique password.
3. Fill in the admin:
   - **Legal → Impressum:** check it is filled in (needs the register number, see step 4), and read through the privacy policy. **Do not share the link before both are complete.**
   - **Contact:** ground address and map pin.
   - **Instagram:** the access token (see ADR-0011).

## 6. Protect `main` (GitHub → Settings → Branches → Add rule for `main`)

- Require a pull request before merging.
- Require status checks: "Lint, types, architecture, unit tests", "Build, E2E and accessibility", "Storybook build".

## 7. Google

1. [Google Search Console](https://search.google.com/search-console) → Add a website → **URL prefix** → the production URL. Verify with the HTML tag method: the token is `siteConfig.googleSiteVerification`, rendered by the root layout.
2. **Sitemaps** → submit `sitemap.xml`.
3. **URL inspection** → the home page → "Request indexing".
4. Optional: a [Google Business Profile](https://business.google.com) for the club (sports club, Erlangen). Link it to the site; this does most for the "Erlangen Cricket Club" search on Maps.

## 8. Custom domain (optional, later)

1. Register the domain (e.g. `erlangen-cricket.de`; a `.de` domain costs about €5 a year, outside the €0 budget, so the club decides).
2. Vercel → Settings → Domains → add it and set the DNS records shown there.
3. Canonicals switch to the new domain on the next deployment. In Search Console, add the new property and use **Change of address**.
4. Point the old WordPress site to the new one (a link or notice on its home page).

## Day to day

- **Deploy:** merge a PR into `main`. Vercel migrates and builds. Pull requests get no preview (ADR-0013).
- **Roll back:** Vercel → Deployments → a previous one → "Promote to Production". Migrations are additive, so the older code still works with the newer schema.
- **New migration:** `pnpm db:migrate:create <name>` locally. Keep it additive: add a column now, remove the old one in a later release.
- **Usage limits:** check Vercel → Usage and the Neon dashboard once a month (risk R-1).
