# Claude Code skills (vendored)

Third-party skills for Claude Code, copied unchanged from their repositories so that everyone working on this project gets the same guidance. They are excluded from Prettier and ESLint. To update one, copy the folder again from the source and change the commit here.

| Skill folder(s) | Source | Commit | Licence |
| --- | --- | --- | --- |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | `dbd4588` | Apache-2.0 (`LICENSE.txt`) |
| `web-design-guidelines`, `react-best-practices`, `composition-patterns`, `react-native-skills` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee9` | MIT |
| `ui-ux-pro-max` | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `50d8a7d` | MIT (`LICENSE`) |
| `bencium-controlled-ux-designer` | [bencium/bencium-marketplace](https://github.com/bencium/bencium-marketplace) | `5de46a3` | MIT (`LICENSE`) |
| `accessibility-audit`, `accessibility-scan`, `accessibility-inspect`, `accessibility-fix`, `accessibility-diff`, `shared` | [AccessLint/skills](https://github.com/AccessLint/skills) | `2e9d733` | MIT |

## Requirements and caveats

- **CLAUDE.md wins.** Where a skill's advice conflicts with this project's rules (stack, tokens, i18n, accessibility, ADRs), `CLAUDE.md` applies.
- `ui-ux-pro-max`: its search scripts need Python 3 and are written for plugin installs (`${CLAUDE_PLUGIN_ROOT}`); without them the skill's written guidance still applies.
- `accessibility-scan` / `-diff` / `-fix` run `npx @accesslint/cli` and `@accesslint/chrome` on demand (downloaded from npm when used); `accessibility-inspect` expects the Chrome DevTools MCP server. The project's own gate stays axe in Playwright (`CLAUDE.md` §8.3).
- `web-design-guidelines` fetches its current rule list from GitHub when used.
- `react-native-skills` targets React Native; this project is web only, so it rarely applies.
