# Boussole Architecture

This document describes the technical architecture as it exists today.

---

## Stack

| Layer | Choice | Why |
|-------|--------|-----|
| UI | HTML + CSS | Small surface area, fast loading, easy offline caching |
| Runtime JS | Vanilla browser JavaScript (ES modules) | No framework overhead; the whole app fits in one file |
| Build | None | Zero tooling friction — edit and refresh |
| Data | Hardcoded in `app.js` (extraction to JSON planned) | Offline by default; extraction is on the roadmap |
| Storage | IndexedDB for logs, `localStorage` for preferences | Durable logs + simple settings |
| Routing | Hash routes | URL-addressable tabs without server rewrites |
| Offline | Service Worker, cache-first | Full app shell available after first load |
| Hosting | Static files (Caddy or equivalent) | Matches the no-server constraint |

---

## File layout

```
/                              ← repo root = app root
├── index.html                 ← PWA shell + sky engine + nav
├── app.js                     ← entire app (logic, state, render, data)
├── styles.css                 ← all UI styling
├── sw.js                      ← Service Worker (cache-first)
├── manifest.webmanifest       ← PWA installability
└── assets/icon.svg            ← compass icon
```

All logic is in `app.js`. There is no separate router, storage module, or i18n file — everything is in one file. See `AGENTS.md` for the internal section map with line numbers.

---

## Single-file app pattern

`app.js` is structured as sequential sections rather than separate ES module files. This is a deliberate choice for this project's scale and the "zero tooling" constraint. The tradeoff is that the file is long (~1300 lines) but navigable with the section map in `AGENTS.md`.

If the file grows significantly, the next split would be pulling out substance data (see **Planned work** below), not splitting by module boundary.

---

## Routing

Hash routes. The router (`render()` in `app.js`) listens to `hashchange` and matches the hash to a screen function.

| Hash | Screen |
|------|--------|
| `#/` | Boussole home |
| `#/rdr` | RDR substance grid |
| `#/info` | Settings & info |
| `#/substances/:id` | Substance detail |

No server-side rewrites are needed because all routes are just `index.html` from the server's perspective.

---

## Storage

**IndexedDB** (`"boussole-db"`, store `"logs"`) holds all log entries. Schema v1:
- Key: `id` (UUID string)
- Fields: `type`, `occurredAt`, `createdAt`, plus type-specific fields

**localStorage** holds small preferences only: selected language, seed flag.

**Fallback**: if IndexedDB is unavailable, `localStorage` key `"boussole.logs"` holds a JSON string of all entries.

There is no migration system yet. Schema changes require a new `indexedDB.open` version and an `onupgradeneeded` handler.

---

## Offline model

1. User opens the app once with network — HTML, JS, CSS, SW, manifest are fetched
2. Service Worker installs and precaches all required assets (see `sw.js`)
3. On subsequent loads (with or without network), the SW returns cached responses

All substance reference data is bundled inside `app.js`, so no network request is needed for content. The only runtime network access is the Space Grotesk font from Google Fonts — this is also cached by the SW after first load.

Cache version is `"boussole-v20"` in `sw.js`. Bump it whenever the asset list changes.

---

## Offline hosting

Caddy serves static files for `boussole.valentinmouret.io`:

```caddyfile
boussole.valentinmouret.io {
  root * /srv/boussole
  file_server

  header /sw.js Cache-Control "no-cache"
  header /index.html Cache-Control "no-cache"
  header /manifest.webmanifest Content-Type "application/manifest+json"
}
```

Hash routing means no single-page-app rewrite rules are needed.

---

## Accessibility & safety constraints

- Large touch targets (festival conditions, impaired fine motor)
- High contrast for dark outdoor settings
- No blocking modals for warnings
- Harm-reduction copy is informative, never judgmental
- Semantic markup for sheets and forms

---

## Planned work

### Substance data extraction

All 10 substance definitions (including doses, effects, risks, and localized copy) are currently hardcoded in `app.js` at lines 117–270. The plan is to extract them to:

```
public/data/substances.json
public/data/interactions.json   ← optional, if interaction rules grow
```

When this is done:
- Fetch the JSON at boot and store in `state`
- Add both JSON files to the Service Worker precache list and bump the cache version
- Update `AGENTS.md` file map and the "add a substance" guide

### Future features

- Push notifications / hydration reminders
- Buddy mode (multi-profile)
- Log notes on entries
- Export / import
