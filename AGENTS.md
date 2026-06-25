# Boussole — Agent & Contributor Guide

## What this is

**Boussole** is a mobile-first PWA for festival-goers and party attendees. Two features:
1. **Hydration tracking** — log water and electrolytes, get contextual nudges
2. **Harm reduction (RDR)** — log substance intake, see dose context, get interaction warnings

Full client-side. No server. No accounts. All data in `localStorage`/`IndexedDB`. Works offline.

Read `PRD.md` for full product requirements and `DESIGN.md` for design decisions.

---

## Tech stack

- **Vanilla HTML / CSS / JS** — no build step, no framework, no TypeScript
- **PWA**: Service Worker + Web App Manifest
- **Storage**: `localStorage` for preferences, `IndexedDB` for logs (thin wrapper, with localStorage fallback)
- **Font**: Space Grotesk (Google Fonts, cached by SW for offline)
- **No runtime dependencies** — one `index.html`, one `app.js`, one `styles.css`

---

## File map

```
/                              ← repo root = app root
├── index.html                 ← PWA shell (127 lines): sky engine, nav, main container
├── app.js                     ← entire app logic (1286 lines)
├── styles.css                 ← all UI styling (1576 lines)
├── sw.js                      ← Service Worker, cache-first (41 lines)
├── manifest.webmanifest       ← PWA installability metadata
├── assets/icon.svg            ← compass icon (SVG)
├── CLAUDE.md                  ← symlink → AGENTS.md (loaded as project context)
├── AGENTS.md                  ← you are here
├── ARCHITECTURE.md            ← technical reference
├── DESIGN.md                  ← design tokens & UI patterns (authoritative)
├── PRD.md                     ← product requirements (authoritative)
├── package.json               ← only used for `npm start` (Python http.server)
└── CNAME                      ← boussole.valentinmouret.io
```

---

## app.js structure (1286 lines)

This is the complete app. All logic lives here.

| Lines | Section |
|-------|---------|
| 1–9 | Constants: `DB_NAME`, `STORE`, storage keys, `$`/`$$` helpers |
| 10–115 | `i18n` — all FR/EN strings (60+ keys) |
| 117–270 | `substances` — all 10 substance definitions (data + doses + copy) |
| 272–278 | `state` — global state object |
| 280–295 | Factory helpers: `substance()`, `dose()`, `rule()` |
| 297–307 | `t(key, values)` — translation lookup |
| 309–332 | `labelForDose()`, `cssDose()`, `openDb()` |
| 334–388 | IndexedDB helpers: `getLogs`, `putLog`, `saveLog` + localStorage fallback |
| 390–456 | `seedLogs()` — demo data on first load |
| 458–474 | `render()` — main router: reads hash → calls screen render function |
| 475–487 | `renderHome()` — Boussole tab |
| 488–526 | `hydrationCard()` — calculates hydration status, renders card HTML |
| 527–566 | `renderRdr()` — RDR tab (substance card grid) |
| 567–645 | `renderInfo()` — Info tab (lang toggle, about, emergency, clear data) |
| 646–671 | `renderSubstancePage(id)` — substance detail page |
| 672–690 | `renderActions(route)` — action bar (only on home) |
| 691–710 | `streamMarkup(logs)` — builds timeline HTML with time separators |
| 711–788 | `entryMarkup(entry)` — single stream entry (water/electrolyte/substance) |
| 789–972 | `renderSheetRoot()` — all sheet/modal HTML (water, substance, RDR info, clear confirm) |
| 973–1003 | `closeSheets()` + overlay logic |
| 1004–1030 | `interactionForSubstanceIds()`, `interactionForSubstanceId()`, `interactionFor(entry)` |
| 1031–1110 | `initWave()` — canvas sine-wave animation (requestAnimationFrame loop) |
| 1111–1240 | All event listeners (click delegation, input, submit, hashchange) |
| 1272–1286 | `boot()` — app entry point |

---

## How to update things

### Add a translation key

1. Add the key to both `i18n.fr` and `i18n.en` at **lines 10–115**
2. Use `t("yourKey")` anywhere in the render functions, or `t("yourKey", { variable: value })` for interpolated strings

### Add a substance

1. Add an entry to the `substances` object at **lines 117–270** using the `substance()` and `dose()` helpers
2. The key becomes the `substanceId` used in logs and routing
3. Add the substance to `renderRdr()` card grid at **line 527** — match the pattern of other substances
4. If it belongs to an MDMA-family pool (for cumulative interaction tracking), set `family: "mdma"` in the `substance()` call
5. If it has multiple routes (e.g. sniffed/oral), populate the `route` array; otherwise pass `null`
6. Add any interaction rules involving the new substance to `interactionForSubstanceIds()` at **line 1004**

### Add an interaction warning

In `interactionForSubstanceIds()` at **line 1004**, add a `rule()` entry:
```js
rule(["substanceA", "substanceB"], "🔴 Très dangereux", "FR warning text", "🔴 Very dangerous", "EN warning text")
```
Rules check if all listed IDs appear in recent logs (within substance-specific timeframes). The warning surfaces in the substance sheet (step 2) and on the home screen if a recent dangerous combo is detected.

### Add a screen / route

1. Add the hash pattern to `render()` at **line 458**
2. Create a `renderMyScreen()` function following the same `$('#app').innerHTML = ...` pattern
3. Add a nav tab in `index.html` (the `<nav class="bottom-nav">` section) if it needs a tab

### Add a translation-only copy change

Edit the relevant key in `i18n.fr` / `i18n.en` at **lines 10–115**. For substance-specific copy (effects, risks, sensations), the substance definition objects at **lines 117–270** contain their own localized text inline — edit directly there.

### Change hydration thresholds

In `hydrationCard()` at **line 488**: threshold constants are inline (e.g. `< 1 * 60 * 60 * 1000` for "good", `< 2.5 * 3600000` for "nudge").

---

## State

```js
let state = {
  lang: "fr" | "en",        // persisted to localStorage
  logs: [],                  // loaded from IndexedDB at boot; kept in sync
  selectedEntry: null,       // for entry detail sheet (tap on stream item)
  lastWarning: null,         // interaction warning to show post-log
  pendingRdrSubstance: null  // substance to preselect when opening from RDR tab
};
```

State is **not reactive**. After any mutation, call `render()` (or close a sheet which triggers a delayed `render()` at line 990 via `sheetResetTimer`).

---

## Storage

**IndexedDB** (primary):
- Database: `"boussole-db"`, Store: `"logs"`, key: `"id"` (UUID)
- `getLogs()` → returns all entries sorted by `occurredAt`
- `putLog(entry)` → upserts to IndexedDB + pushes to `state.logs`
- `saveLog(entry)` → used only for seed data writes

**localStorage** (fallback + preferences):
- `boussole.lang` — `"fr"` or `"en"`
- `boussole.logs` — JSON string fallback if IndexedDB is unavailable
- `boussole.seeded` — prevents re-seeding after first run

**Log entry shapes:**
```js
// Water
{ id, type: "water", amount, detail, createdAt, occurredAt }

// Electrolyte
{ id, type: "electrolyte", detail, createdAt, occurredAt }

// Substance
{ id, type: "substance", substanceId, family, doseKey, doseLabel, doseDetail, createdAt, occurredAt }
```

All times are ISO 8601 strings. `occurredAt` is what the user sets (defaults to now); `createdAt` is always the actual write time.

---

## Navigation & routing

Hash-based. `render()` reads `location.hash` and dispatches to screen functions.

| Hash | Screen |
|------|--------|
| `#/` or empty | Boussole home |
| `#/rdr` | RDR substance grid |
| `#/info` | Settings / info |
| `#/substances/:id` | Substance detail page |

The bottom nav in `index.html` sets `location.hash`. `render()` is called on `hashchange` and on `boot()`.

---

## Sheets

All sheet HTML is rendered by `renderSheetRoot()` (line 789) into `#sheetRoot` on every `render()`. Sheets open/close by toggling `.open` on the relevant container. The overlay dismisses on backdrop click.

After a sheet closes, a 380ms timer (`sheetResetTimer`) fires `render()` to clean up state — this delay lets the CSS close animation play before the DOM is reset.

**Three sheets:**
1. **Water sheet** (`[data-sheet="water"]`) — type toggle (Eau/Électrolytes), presets, time picker, confirm
2. **Substance sheet** (`[data-sheet="substance"]`) — step 1: substance grid; step 2: route + dose presets + time + confirm
3. **RDR info sheet** (`[data-sheet="rdr-info"]`) — reference info for a substance (not for logging)

---

## Design tokens

The background is a **living sky gradient** driven by time of day ("Ciel Vivant"). It is updated every 60 seconds via an inline `<script>` in `index.html` that sets CSS custom properties on `:root`.

Sky phases:
| Time | Sky | Text |
|------|-----|------|
| 00h–05h | Deep night (dark purple/blue) | Light |
| 06h–08h | Sunrise (orange/peach) | Dark |
| 12h–16h | Daytime (cream/pale yellow) | Dark |
| 17h–21h | Sunset (coral/deep red) | Light |
| 21h–23h | Evening (deep purple) | Light |

Fixed color tokens (never change with sky):
```css
--water: #3DDBD9        /* teal — hydration entries */
--electrolyte: #A78BFA  /* purple — electrolyte entries */
--substance: #FF6B6B    /* coral — substance entries */
--primary: #FFBE0B      /* solar yellow — brand/action color */
--dose-light: #06D6A0   /* Léger */
--dose-common: #FFBE0B  /* Commun */
--dose-strong: #FF9F1C  /* Fort */
--dose-heavy: #FF6B6B   /* Lourd */
```

Layout tokens:
```css
--nav-height: 90px
--actions-height: 76px
--radius: 20px
```

Do not hardcode `--bg`, `--surface`, `--text`, or `--text-muted` — these are set dynamically by the sky engine.

---

## The Stream (wave animation)

`initWave()` (line 1031) runs a `requestAnimationFrame` loop on a `<canvas>` element positioned on the left edge of the stream. It draws a sine wave flowing downward, with:
- Amplitude ~11px, wavelength 145px
- Teal-to-bright gradient from top to bottom
- A glowing pulsing "now" dot at the bottom tip
- Colored dots (teal/purple/coral) at each entry's y-position

`initWave()` is called after every `renderHome()`. It cancels any previous frame loop via `waveAnimation` handle.

---

## Service Worker

`sw.js` (41 lines) uses a **cache-first** strategy:
- Cache version: `"boussole-v20"` — bump this whenever the asset list changes
- Precached assets: `./`, `./index.html`, `./styles.css`, `./app.js`, `./manifest.webmanifest`, `./assets/icon.svg`
- Navigation requests fall back to cached `index.html`

---

## What is built vs. deferred

### Done (MVP-complete)
- All 3 navigation tabs with hash routing
- Hydration logging (water + electrolytes) with contextual status card
- All 10 substances with full bundled reference data
- Dose input with Léger/Commun/Fort/Lourd categories
- 7 interaction warnings
- Bilingual UI (FR/EN) with toggle
- Animated wave timeline (canvas)
- All sheets: water, electrolyte, substance (2-step), RDR info, clear data
- IndexedDB + localStorage persistence
- Service Worker (offline-first after first load)
- Emergency contacts (SAMU, suicide hotline, medic)
- About & sources section

### Deferred (not MVP)
- Push notifications / hydration reminders
- Buddy mode (multi-profile on one device)
- Log notes (tap entry → add note) — UI exists but submit not wired
- Export / import logs
- Cloud sync or accounts

---

## Known planned work

- **Substance data extraction**: all substance definitions are currently hardcoded in `app.js` (lines 117–270). The plan is to extract them to `public/data/substances.json` (and possibly `interactions.json`) to make updates easier and to let the Service Worker cache them independently. When doing this, the Service Worker cache version must be bumped and the asset list updated.
