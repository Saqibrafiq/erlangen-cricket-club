# 9. Architecture Decisions

Decisions follow the [MADR](https://adr.github.io/madr/) template ([`template.md`](template.md)). Files are named `NNNN-title.md`.

| ADR                                                               | Title                                                             | Status   |
| ----------------------------------------------------------------- | ----------------------------------------------------------------- | -------- |
| [0001](0001-modular-monolith-with-next-and-payload.md)            | Modular monolith with Next.js and Payload CMS                     | Accepted |
| [0002](0002-keep-set-request-locale-until-root-params-support.md) | Keep next-intl `setRequestLocale` until root params work          | Accepted |
| [0003](0003-own-match-data-in-payload.md)                         | Own match data in Payload; import from CricClubs, never scrape    | Accepted |
| [0004](0004-database-schema-via-migrations-only.md)               | Database schema changes via migrations only                       | Accepted |
| [0005](0005-fixtures-pages-per-competition.md)                    | Fixtures: one page per competition, reached via a header dropdown | Accepted |
| [0006](0006-standings-from-published-tables.md)                   | Standings show the published league tables, entered in the CMS    | Accepted |
| [0007](0007-contact-messages-stored-in-cms.md)                    | Contact messages stored in the CMS, protected by a honeypot       | Accepted |
| [0008](0008-maps-load-on-request.md)                              | Maps load on request (OpenStreetMap, two-click)                   | Accepted |
| [0009](0009-player-profiles-require-recorded-consent.md)          | Player profiles require recorded consent                          | Accepted |
