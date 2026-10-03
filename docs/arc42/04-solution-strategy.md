# 4. Solution Strategy

| Quality goal / constraint | Approach                                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Team of one, €0 cost      | **Modular monolith**: Next.js and Payload CMS in one deployable ([ADR-0001](09-architecture-decisions/0001-modular-monolith-with-next-and-payload.md)). |
| Maintainability           | **Vertical feature slices** with a public `index.ts`; layering enforced by dependency-cruiser in CI.                                                    |
| Data correctness          | **Single source of truth**: scorecards. Stats, Hall of Fame and standings are derived by pure functions in `src/domain/`, 100% branch-covered.          |
| Performance               | React Server Components by default, static generation per locale, ISR with tag-based revalidation from Payload hooks.                                   |
| SEO                       | `generateMetadata` on every route, hreflang alternates, sitemap/robots, JSON-LD, human-readable slugs.                                                  |
| Accessibility             | Semantic HTML, design-system primitives with tests and stories, axe in Playwright and Storybook.                                                        |
| Privacy (GDPR)            | Self-hosted fonts via `next/font`, cookieless analytics, no third-party captcha.                                                                        |
| Fail fast                 | Zod validates env vars at startup and all external input at the boundary.                                                                               |
