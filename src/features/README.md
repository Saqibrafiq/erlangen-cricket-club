# Features

One folder per business capability (vertical slice): `players/`, `fixtures/`, `standings/`, `stories/`, `hall-of-fame/`, `membership/`, `achievements/`.

```
<feature>/
  components/   Feature UI (Server Components by default)
  server/       queries.ts, actions.ts — the only place that talks to Payload
  domain/       Pure feature logic (optional)
  types.ts
  index.ts      Public API — the only file other modules may import
```

Boundaries are enforced by `pnpm depcruise` (see `.dependency-cruiser.cjs`).
