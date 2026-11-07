# Changelog

Generated from the [Conventional Commits](https://www.conventionalcommits.org/) history, newest first. Each pull request is squash-merged into `main` and deployed.

## November 2026

### Features

- motion everywhere (#27)
- **players:** career stats from the league's 2025/2026 season records
- **header:** glass pill navbar that shrinks into a floating pill, and a hero film
- **theme:** three themes in the club kits (light, dark, ECC), switchable in the header
- **auth:** account menu in the header, sign in from a panel, toasts
- **home:** show the host club's code and the ground address in the next match
- **fixtures:** edit and delete fixtures on the website; template with only home and away
- **fixtures:** add the BCV grounds and play at the home team's ground
- **fixtures:** import season schedules from a CSV template, with saved grounds and seasons

### Fixes

- **players:** match the live squad's short names, and add a dry run (#28)
- **storybook:** stub the player seasons query for the browser build
- **theme:** keep text on cream logo panels dark in every theme
- **fixtures:** put the edit and delete buttons inside the card's bottom row

### Tests

- **fixtures:** scope the fixture count to the page, next to the site-wide toast region

## October 2026

### Features

- **standings:** import league tables from CricClubs CSV exports, show the current season
- **sponsors:** add, edit and delete sponsors on the website with a dissolve-on-delete effect
- **news:** write, publish, edit and delete news on the website
- **players:** edit players on the website with automatic photo cut-outs
- **auth:** add club sign-in page for editors with header login icon
- **footer:** add club footer with visit details and website credit; license code as proprietary
- **home:** add scrollytelling home page with scoreboard countdown, titles and Instagram feed
- **players:** add Saqib Rafiq to the squad
- **players:** add squad page and player profiles with recorded consent
- **sponsors:** add sponsors page with title sponsor, partners and how to become a sponsor
- **journey:** add club story and milestone timeline
- **membership:** add membership and contact pages
- **news:** add news pages and migrate 24 articles from the old site
- **standings:** show published league tables with club summary cards
- **fixtures:** add fixtures & results for all 2026 competitions

### Fixes

- **deploy:** build main on Vercel instead of skipping every build
- **cms:** refuse to seed Blob storage while local upload folders exist
- **cms:** add Blob storage columns in every environment
- **navigation:** add slide-in phone menu and keep the slim header sticky on all screens

### Tests

- **auth:** keep href and origin when stubbing location

### CI

- use the runner's PostgreSQL instead of pulling a container image
- pull the Postgres service image from the ECR Public mirror
- generate next route types before linting

### Chores

- **seo:** verify the site in Google Search Console
- **deploy:** configure Vercel production with Neon, migrations in the build and legal pages
- add Claude Code skills for design, React and accessibility
- set up next.js 16 and payload cms 3 application foundation
- initial commit
