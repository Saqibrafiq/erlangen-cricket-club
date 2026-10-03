# 2. Constraints

## 2.1 Technical constraints

| Constraint                                    | Background                                                                 |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| €0 running cost                               | Club budget. Only free tiers (Vercel Hobby, Neon, Sentry) and open source. |
| Fixed tech stack (see `CLAUDE.md` §3)         | Changes require an ADR.                                                    |
| Node.js 24 LTS, pnpm                          | Runtime parity between local, CI and Vercel.                               |
| Serverless hosting (Vercel)                   | No long-running processes; DB connections must suit serverless.            |
| Free-tier limits (Neon storage/compute, Blob) | Media must be optimised; scale-to-zero DB adds cold-start latency.         |

## 2.2 Organisational constraints

| Constraint              | Background                                                         |
| ----------------------- | ------------------------------------------------------------------ |
| Team of one developer   | Favours a monolith and convention over configuration (ADR-0001).   |
| Non-technical editors   | The admin UI must be usable without training.                      |
| Trunk-based development | Short-lived branches, squash merge, automatic deploys from `main`. |

## 2.3 Legal constraints (Germany)

| Constraint                                | Consequence                                                        |
| ----------------------------------------- | ------------------------------------------------------------------ |
| Impressum (§ 5 DDG), Datenschutzerklärung | Mandatory pages, linked in the footer.                             |
| GDPR / TTDSG                              | No tracking cookies; self-hosted fonts; cookieless analytics only. |
| Consent for personal data                 | Player profiles published only with a recorded consent flag.       |
| BFSG / EN 301 549                         | WCAG 2.2 AA as accessibility baseline.                             |
