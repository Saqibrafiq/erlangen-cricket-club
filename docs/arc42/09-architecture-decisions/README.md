# 9. Architecture Decisions

Decisions follow the [MADR](https://adr.github.io/madr/) template ([`template.md`](template.md)). Files are named `NNNN-title.md`.

| ADR                                                               | Title                                                                            | Status   |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- | -------- |
| [0001](0001-modular-monolith-with-next-and-payload.md)            | Modular monolith with Next.js and Payload CMS                                    | Accepted |
| [0002](0002-keep-set-request-locale-until-root-params-support.md) | Keep next-intl `setRequestLocale` until root params work                         | Accepted |
| [0003](0003-own-match-data-in-payload.md)                         | Own match data in Payload; import from CricClubs, never scrape                   | Accepted |
| [0004](0004-database-schema-via-migrations-only.md)               | Database schema changes via migrations only                                      | Accepted |
| [0005](0005-fixtures-pages-per-competition.md)                    | Fixtures: one page per competition, reached via a header dropdown                | Accepted |
| [0006](0006-standings-from-published-tables.md)                   | Standings show the published league tables, entered in the CMS                   | Accepted |
| [0007](0007-contact-messages-stored-in-cms.md)                    | Contact messages stored in the CMS, protected by a honeypot                      | Accepted |
| [0008](0008-maps-load-on-request.md)                              | Maps load on request (OpenStreetMap, two-click)                                  | Accepted |
| [0017](0017-edit-news-on-the-website.md)                          | Edit news on the website with a visual Lexical editor                            | Accepted |
| [0016](0016-player-photo-background-removal-in-the-browser.md)    | Player photos: background removed in the editor's browser, all files self-hosted | Accepted |
| [0015](0015-edit-content-on-the-website.md)                       | Edit content on the website itself; static pages stay static                     | Accepted |
| [0014](0014-club-sign-in-page-on-payload-auth.md)                 | Club sign-in page on top of Payload's authentication                             | Accepted |
| [0013](0013-production-on-vercel-and-neon.md)                     | Production on Vercel and Neon (Frankfurt); migrations in the build               | Accepted |
| [0012](0012-proprietary-licence.md)                               | Code and design under a proprietary licence; club content stays the club's       | Accepted |
| [0011](0011-instagram-feed-via-api.md)                            | Instagram posts via the Instagram API, served without third-party requests       | Accepted |
| [0010](0010-instagram-graphics-generated-on-request.md)           | Instagram post graphics generated on request                                     | Accepted |
| [0009](0009-player-profiles-require-recorded-consent.md)          | Player profiles require recorded consent                                         | Accepted |
