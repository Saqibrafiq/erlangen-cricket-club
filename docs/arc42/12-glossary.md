# 12. Glossary

Code uses the English term (camelCase where applicable).

| Term (EN)            | Term (DE)                   | Code              | Definition                                                                                                 |
| -------------------- | --------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------- |
| Innings              | Innings                     | `innings`         | A team's or batter's turn to bat.                                                                          |
| Fixture              | Spiel / Ansetzung           | `fixture`         | A scheduled match.                                                                                         |
| Scorecard            | Spielbericht / Scorecard    | `scorecard`       | Record of all batting, bowling and fielding performances in a match; the single source of truth for stats. |
| Wicket               | Wicket                      | `wicket`          | A dismissal of a batter (also the stumps).                                                                 |
| Over                 | Over                        | `overs`           | Six legal deliveries by one bowler.                                                                        |
| Not out              | Nicht aus                   | `notOut`          | Batter still in at the end of an innings; not counted as a dismissal.                                      |
| Dismissal            | Aus                         | `dismissals`      | An innings in which the batter was out.                                                                    |
| Batting average      | Schlagdurchschnitt          | `battingAverage`  | Runs ÷ dismissals; undefined (`null`) if never dismissed.                                                  |
| Strike rate          | Strike Rate                 | `strikeRate`      | Runs per 100 balls faced.                                                                                  |
| Economy rate         | Economy                     | `economyRate`     | Runs conceded per over bowled.                                                                             |
| Century              | Century (Hundert)           | `century`         | 100 or more runs in one innings.                                                                           |
| Five-wicket haul     | Five-Wicket-Haul            | `fiveWicketHaul`  | Five or more wickets by one bowler in one innings.                                                         |
| Net run rate         | Netto-Run-Rate              | `netRunRate`      | Tie-breaker in standings: run rate scored minus run rate conceded.                                         |
| Standings            | Tabelle                     | `standings`       | League table as published by the league; entered in the CMS.                                               |
| Result margin        | Siegvorsprung               | `ResultMargin`    | Runs (team batting first wins) or wickets in hand (chasing team wins). Derived from innings.               |
| DLS method           | DLS-Methode                 | `dls`             | Duckworth–Lewis–Stern: revises targets in rain-shortened matches; result is entered as published.          |
| Forfeit              | Kampflose Wertung (Forfeit) | `forfeit`         | A team concedes; the match is awarded to the opponent ("Forfeited. Winner: X" on CricClubs).               |
| Walkover             | Walkover                    | `walkover`        | The opponent does not turn up; the match is awarded without play ("Winner: X" on CricClubs).               |
| Fixture category     | Spielkategorie              | `FixtureCategory` | Filter bucket: upcoming, completed, abandoned (incl. cancelled and no result), walkover, forfeit.          |
| Tie                  | Unentschieden (Tie)         | `tie`             | Both teams finish on the same score (or as declared under DLS).                                            |
| No result            | Kein Ergebnis               | `no-result`       | Match started but could not be completed with a result.                                                    |
| Stage                | Runde                       | `stage`           | Part of a competition: league, qualifier, semi-final, final.                                               |
| Featured competition | Hervorgehobener Wettbewerb  | `isFeatured`      | A competition whose next match the home page counts down to (T20 Regionalliga, DCB-Bundesliga).            |
| Home game            | Heimspiel                   | `home`            | A fixture at a ground in Erlangen; derived from the venue (`getVenueKind`).                                |
| Away game            | Auswärtsspiel               | `away`            | A fixture at a ground outside Erlangen.                                                                    |
| Kick-off             | Spielbeginn                 | `kickoff`         | Start of a fixture: its day plus local start time (`getKickoff`), in Europe/Berlin.                        |
| Club team            | Vereinsmannschaft           | `isClubTeam`      | An Erlangen Cricket Club team; results are shown from its perspective.                                     |
| Hall of Fame         | Ruhmeshalle                 | `hallOfFame`      | Milestones derived from scorecards.                                                                        |
| Player               | Spieler                     | `players`         | Club member shown on the website; only with recorded consent (`hasPublishConsent`).                        |
| Playing role         | Spielerrolle                | `playingRole`     | Batter, bowler, all-rounder or wicketkeeper.                                                               |
| Squad                | Kader                       | —                 | All players shown on the players page.                                                                     |
| News article         | Neuigkeit / Beitrag         | `news`            | Club news (sponsors, events, reports) maintained by editors; published or draft.                           |
| Active membership    | Aktive Mitgliedschaft       | `active`          | Membership including league and tournament matches (plus a fee per tournament match).                      |
| Passive membership   | Passive Mitgliedschaft      | `passive`         | Membership for training, indoor cricket and friendlies, without league matches.                            |
| Honeypot             | Honeypot                    | `HONEYPOT_FIELD`  | Form field hidden from people; bots that fill it in are ignored. Replaces a captcha.                       |
| Impressum            | Impressum                   | —                 | Legally required provider identification (§ 5 DDG).                                                        |
| Datenschutzerklärung | Datenschutzerklärung        | —                 | Privacy policy required by GDPR.                                                                           |
