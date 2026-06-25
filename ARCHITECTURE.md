# Boussole Architecture

This document defines the technical stack and implementation shape for Boussole.
It is for contributors building the app from `PRD.md` and `DESIGN.md`.

Boussole is a mobile-first Progressive Web App (PWA). It runs fully on the
user's device, stores all personal data in browser storage, and remains usable
without network after it has been loaded or installed once.

## Product Constraints

Boussole must satisfy these constraints:

- Work on iOS Safari and Android Chrome.
- Be installable as a PWA.
- Keep all personal data on the device.
- Work offline after the app is installed or cached.
- Bundle all app assets and harm-reduction reference content.
- Use French as the default language and support English.
- Use non-judging, factual, informative harm-reduction copy.
- Avoid runtime dependencies unless they clearly reduce product risk.

This document does not cover visual design details, product copy, or the
substance information itself. Those live in `DESIGN.md`, `PRD.md`, and bundled
JSON data files.

## Stack Summary

| Layer | Choice | Reason |
| --- | --- | --- |
| UI | HTML and CSS | Small surface area, fast loading, easy offline caching |
| Runtime JS | Browser JavaScript modules | Native platform support, no framework runtime |
| Typed logic | TypeScript compiled to JavaScript | Type safety where mistakes matter: storage, dosing, interactions, i18n |
| Build | `tsc` only | Adds types without adding a bundler |
| Data | Bundled JSON | Offline reference content, easy review, no server |
| Storage | IndexedDB for logs, `localStorage` for small preferences | Durable logs plus simple settings |
| Routing | Hash routes | URL-addressable tabs without server routing |
| Offline | Service Worker precache | Full app shell and data available after first successful load |
| Hosting | Static files behind Caddy | Fits the VPC and no-server product constraint |
| Tests | Node test runner for compiled logic | Tests important rules without a browser test dependency |

## Offline Model

A web app cannot be opened from `boussole.valentinmouret.io` for the first time
with no network at all. The browser needs one successful network path to fetch
the HTML, Service Worker, manifest, and assets.

Boussole should therefore optimize for this flow:

1. The user opens the app once with network.
2. The Service Worker installs and precaches every required asset.
3. The user can later open and use the app with no reception.

The app should not depend on runtime network access. Fonts, icons, CSS,
JavaScript, the manifest, and substance JSON files should be bundled locally and
included in the Service Worker precache list.

If true first-open-without-internet distribution becomes required, Boussole would
need a different delivery mechanism, such as a previously installed PWA, a local
file bundle, or a native wrapper. That is outside the current architecture.

## Runtime Architecture

The app should ship as static files:

```text
public/
  index.html
  styles.css
  manifest.webmanifest
  sw.js
  assets/
    icons/
    fonts/
  data/
    substances.json
    i18n.json
src/
  app.ts
  router.ts
  storage.ts
  hydration.ts
  substances.ts
  interactions.ts
  i18n.ts
  time.ts
tests/
  *.test.ts
```

`public/index.html` is the only HTML document. It loads `styles.css` and the
compiled `app.js` module. The app renders screens into semantic HTML containers
inside the document.

CSS remains plain CSS. Use the design tokens from `DESIGN.md` as CSS custom
properties.

JavaScript should stay close to the platform:

- Use DOM APIs directly.
- Use native `<dialog>` or accessible bottom-sheet markup for sheets.
- Use `Date`-based calculations from stored timestamps for countdowns and
  elapsed time.
- Use `requestAnimationFrame` only for the stream wave animation.

## TypeScript Boundary

TypeScript should protect the logic that can create safety or data bugs:

- Log entry types.
- Storage schema and migrations.
- Dose presets and dose categories.
- Interaction warnings.
- Hydration status calculations.
- i18n key lookup.
- Time and duration formatting.

HTML and CSS do not need a framework. UI code can be TypeScript when it handles
state or user input.

Use `tsc` to compile `src/*.ts` to browser JavaScript modules. Do not add a
bundler unless native modules become painful in practice.

## Routing

Use hash routes because they work on a static host without Caddy rewrites:

| Route | Screen |
| --- | --- |
| `#/` | Boussole home |
| `#/rdr` | RDR screen |
| `#/info` | Info screen |
| `#/substances/:id` | Substance info page |

The bottom nav updates `location.hash`. The router listens to `hashchange` and
renders the active screen.

This keeps pages linkable while preserving static hosting.

## Storage

Use IndexedDB for durable app data:

- Hydration logs.
- Substance logs.
- Entry notes.
- Future schema migrations.

Use `localStorage` only for small preferences:

- Selected language.
- Dismissed install banner state.
- Last seen app version, if needed.

Do not store personal data on a server. Do not add account, sync, import, or
export features for the MVP.

Each log entry should use stable identifiers and timestamps:

```ts
type LogEntryBase = {
  id: string;
  createdAt: string;
  occurredAt: string;
  note?: string;
};
```

Use ISO 8601 strings for stored times. Calculate relative labels and remaining
durations at render time.

## Bundled Data

Keep substance definitions and copy in JSON files under `public/data/`.

The substance JSON should include:

- Stable substance IDs.
- Localized names and copy.
- Route definitions.
- Dose presets and units.
- Dose category thresholds.
- Onset and duration ranges.
- Risks and interaction notes.
- Source URLs.

Interaction rules can either live in `substances.json` or a separate
`interactions.json` if the matrix grows. The app should load all required JSON
at startup and cache it through the Service Worker.

## Internationalization

French is the default language. English is available through a manual toggle in
the Info tab.

Use explicit translation keys rather than inline UI strings. Persist the
selected language in `localStorage`.

All content needed offline must be bundled:

- UI labels.
- Hydration messages.
- Warnings.
- Substance pages.
- Emergency/help content.

## Service Worker

The Service Worker should precache the complete app shell:

- `/`
- `/index.html`
- `/styles.css`
- `/manifest.webmanifest`
- compiled JavaScript modules
- local fonts
- icons
- bundled JSON data

Use a cache version constant in `sw.js`. When the asset list changes, update the
cache version.

Recommended fetch behavior:

- Cache-first for static assets and JSON.
- Network-first is not required for MVP because there is no server data.
- Return cached `index.html` for navigation requests.

The app should still handle a failed Service Worker install gracefully. If the
first load succeeds but caching fails, show a small offline-readiness warning in
the Info screen.

## Hosting With Caddy

Caddy serves static files for `boussole.valentinmouret.io`.

The host needs:

- HTTPS.
- Correct PWA MIME types.
- Long-lived cache headers for versioned static assets.
- Conservative cache headers for `index.html` and `sw.js`.

Because routing uses hashes, Caddy does not need single-page-app rewrite rules.
Every route is still `index.html` from the server's perspective.

Example Caddy shape:

```caddyfile
boussole.valentinmouret.io {
  root * /srv/boussole/public
  file_server

  header /sw.js Cache-Control "no-cache"
  header /index.html Cache-Control "no-cache"
  header /manifest.webmanifest Content-Type "application/manifest+json"
}
```

## Dependencies

Dependencies must justify their place.

Allowed by default:

- `typescript` as a development dependency.

Possible later, only if needed:

- `@playwright/test` for browser-level PWA and offline checks.
- A small IndexedDB helper if handwritten IndexedDB code becomes a source of
  bugs.

Avoid by default:

- UI frameworks.
- CSS frameworks.
- Runtime state libraries.
- Bundlers.
- Analytics.
- Remote font loading.

## Testing Strategy

Start with automated tests for logic that affects safety or persistence:

- Dose category classification.
- Substance interaction detection.
- MDMA-family cumulative logic across Ecstasy and MDMA.
- LSD route variants sharing one substance timeline.
- Hydration status and electrolyte nudges.
- Storage serialization and migration helpers.
- i18n key coverage for French and English.

Use Node's built-in test runner against compiled JavaScript. Add browser tests
later when the PWA shell, Service Worker, and install behavior need regression
coverage.

Manual checks for MVP:

- Load once online, then reload offline.
- Install on iOS Safari.
- Install on Android Chrome.
- Confirm all substance pages open offline.
- Confirm logs persist after closing and reopening the app.
- Confirm timers survive backgrounding because they derive from timestamps.

## Accessibility And Safety

The UI should remain usable in festival conditions:

- Large touch targets.
- High contrast in dark outdoor settings.
- No blocking modals for warnings.
- Calm warning copy that explains risk and gives an action.
- Semantic controls for sheets, tabs, and forms.
- No color-only meaning for dose or danger levels.

Harm-reduction warnings should inform rather than judge. The app should never
shame the user, but it should be clear when a combination or dose is risky.

## Initial Implementation Order

Build in this order:

1. Create the static PWA shell: `index.html`, `styles.css`, manifest, and
   Service Worker registration.
2. Add TypeScript compilation with no bundler.
3. Add typed data models and IndexedDB storage.
4. Add i18n loading and the French default.
5. Add hash routing and bottom navigation.
6. Build the Boussole home screen and hydration flow.
7. Add bundled substance JSON and substance info pages.
8. Build the RDR logging flow and interaction warnings.
9. Add Service Worker precaching for every required file.
10. Add logic tests and manual PWA/offline verification.
