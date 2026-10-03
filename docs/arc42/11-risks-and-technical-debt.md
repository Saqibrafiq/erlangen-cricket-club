# 11. Risks & Technical Debt

## 11.1 Risks

| ID  | Risk                                                               | Probability | Impact | Mitigation                                                                                |
| --- | ------------------------------------------------------------------ | ----------- | ------ | ----------------------------------------------------------------------------------------- |
| R-1 | Free-tier limits change or are exceeded (Vercel, Neon, Blob)       | Medium      | High   | Static rendering/ISR to minimise function and DB usage; image optimisation; monitor usage |
| R-2 | Neon scale-to-zero cold starts slow the first admin request        | High        | Low    | Public pages are static; only admin and revalidation hit the DB                           |
| R-3 | Brand colours are provisional (not yet derived from the club logo) | High        | Medium | Colours exist only as tokens in `globals.css`; replace values and re-check contrast       |
| R-4 | Player personal data published without consent                     | Low         | High   | Consent flag on player records; public queries filter on it (planned)                     |
| R-5 | Single maintainer (bus factor 1)                                   | High        | Medium | arc42 docs, ADRs, enforced conventions, CI                                                |

## 11.2 Technical debt

| ID   | Debt                                                                                                            | Reference                                                                                       |
| ---- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| TD-1 | Deprecated next-intl `setRequestLocale` / `requestLocale` in use                                                | [ADR-0002](09-architecture-decisions/0002-keep-set-request-locale-until-root-params-support.md) |
| TD-2 | Lighthouse CI, SonarCloud, Sentry and Vercel analytics not yet wired (need accounts/tokens)                     | Setup follow-up                                                                                 |
| TD-3 | MSW, Motion, TanStack Table and charts not installed yet — added with the first feature that needs them (YAGNI) | `CLAUDE.md` §3                                                                                  |
| TD-4 | `CHANGELOG.md` generation from commits not yet automated                                                        | `CLAUDE.md` §12                                                                                 |
