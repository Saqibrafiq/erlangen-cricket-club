# 0020. Three themes (Light, Dark, ECC), chosen in the browser

- Status: accepted
- Date: 2026-11-04

## Context

The site followed the device's light or dark setting, with no way to choose. The club wants a choice between Light, Dark and a theme that looks like the club kit: navy sleeves, a red-to-gold body and gold trim. All three should use the kit's colours. Pages are static (ISR) for speed and SEO (§9), and the site sets no cookies beyond sign-in (§10).

## Decision Drivers

- No flash of the wrong theme on load.
- Pages stay static: the server must not render per visitor.
- Every theme meets WCAG 2.2 AA; body text aims for 7:1.
- Components stay unaware of themes (no `dark:` variants).

## Considered Options

1. **`data-theme` on `<html>`, set from browser storage by a tiny inline script before the first paint.**
2. A theme cookie read by the server, which renders per request and makes every page dynamic.
3. `prefers-color-scheme` only (as before): no ECC theme and no choice.

## Decision

Option 1.

- **Choice:** `THEME_STORAGE_KEY` holds the choice in localStorage. It is a preference that never leaves the browser, so it isn't a tracking cookie.
- **Pre-paint script:** `THEME_SCRIPT` (in `shared/config/theme.ts`) runs first in `<head>` and sets `data-theme` to light, dark or ecc. "Auto" resolves from `prefers-color-scheme` and follows the device while the page is open (`useTheme`). Without JavaScript the site is light.
- **Tokens:** `globals.css` keeps one token set per theme. Light is the `@theme` default; `[data-theme='dark']` and `[data-theme='ecc']` override it. Components only use tokens.
- **Palettes:** chosen in OKLCH and checked pair by pair before use. Body text is about 16–17:1, muted text above 6.5:1, buttons above 5:1 and focus rings above 4.5:1. axe checks contrast again in the browser for every theme (`e2e/theme.spec.ts`).
  - **All three use the club's kits.** Dark and ECC use the match kit: navy sleeves, an orange-red body, gold trim. Light uses the second kit: a green and yellow shirt with a blue collar.
  - **The scoreboard** has its own light text colour (`text-on-scoreboard`), because the band text is dark in the light theme.
  - **No pure white anywhere:** light text on dark bands, buttons and logo panels are a soft cream (`text-on-media`, `surface-logo`). The only exception is the Union Jack, whose white is part of the flag.
  - **Light (the second kit):** soft mint surfaces with deep-blue text, collar-blue actions and pale yellow highlights. The hero and bands are the shirt in pastel, green to yellow, with blue text; only the scoreboard stays dark.
  - **Dark:** layered navy-charcoal surfaces (lighter as they come forward), warm off-white text, bright kit orange for actions, gold focus ring.
  - **ECC (the jersey):** a navy page like the sleeves, and the shirt's body on the hero and bands, darkened to navy, crimson and burnt orange so it doesn't glare. Buttons are amber to gold. Gradients can't be colour tokens, so `[data-theme='ecc']` paints `.bg-media-overlay`, `.bg-brand-surface` and `.bg-brand-primary` with them. The bands are darkened versions of the shirt, so white text on every gradient stop stays at 6:1 or more. A thin red-to-gold line runs under the header.
- **Switcher:** `ThemeSwitcher` in the header (Auto, Light, Dark, ECC, with colour swatches). Its menu springs open with Motion, the options stagger in, the selection glides to the new choice (`layoutId`), and the menu stays open so themes can be compared.
- **Switching:** the new theme spreads from the button as a growing circle, a View Transition whose new snapshot is revealed with the Web Animations API (Motion's `animate()` can't target the pseudo-elements). Browsers without View Transitions blend the colours for 200 ms. Under reduced motion the switch is instant.

## Consequences

- Good: the choice applies before the first paint, pages stay static, and themes are a token change away.
- Good: each palette is measured, not eyeballed, and contrast is tested in CI.
- Bad: the switcher's swatches repeat three colours per theme by hand; they must follow the tokens.
- Bad: a visitor's choice is per browser, not per account.
