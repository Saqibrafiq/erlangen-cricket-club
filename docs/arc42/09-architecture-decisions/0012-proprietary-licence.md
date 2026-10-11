# 0012. Code and design under a proprietary licence; club content stays the club's

- Status: accepted
- Date: 2026-10-11

## Context

The website is built by Saqib Rafiq as the club's site and as a portfolio project. The repository is public (SonarCloud's free plan and recruiters need to see it). `package.json` said MIT, but there was no LICENSE file, so the terms were unclear. The site also contains material that is not the author's: the club's name and crest, player photos, match data and texts.

## Decision Drivers

- The author keeps ownership of the code and design, and the website says who built it.
- Recruiters can read the code; others cannot reuse it without permission.
- Ownership claims stay honest: club content is not the author's to license.

## Considered Options

1. **All rights reserved**, published for viewing only.
2. MIT (open source).
3. Source-available, non-commercial (PolyForm Noncommercial).

## Decision

Chosen option 1.

- `LICENSE`: © Saqib Rafiq, all rights reserved. The code is published for viewing only, and Erlangen Cricket Club may use it to run its own website. Club content is excluded and stays with the club and the people shown. Third-party parts (npm packages, the OFL-licensed Barlow fonts, the vendored skills) keep their own licences.
- `package.json`: `"license": "UNLICENSED"`, author Saqib Rafiq.
- Footer bottom bar: "© {year} Erlangen Cricket Club" with a note that the club's name, crest, photos and texts belong to the club, plus "Website designed and built by Saqib Rafiq" (the name only, without a link) and "Website design and code © {year} Saqib Rafiq. All rights reserved." The author's details live in `siteConfig.author`.

## Consequences

- Good: clear ownership on GitHub and on the website; the club's rights are respected.
- Bad: nobody can contribute or reuse code without asking; a future maintainer for the club needs the author's written permission (or a separate agreement) to change the site.
- Follow-up: put the club's right of use in writing with the board before launch.
