# Boussole — Project Context

## What this is

**Boussole** is a mobile-first PWA for festival-goers and party attendees. Two features:
1. **Hydration tracking** — log water and electrolytes, get contextual nudges
2. **Harm reduction (RDR)** — log substance intake, see dose context, get interaction warnings

Full client-side. No server. No accounts. All data in `localStorage`/`IndexedDB`. Works offline.

Read `PRD.md` for full product requirements and `DESIGN.md` for design decisions.

---

## Tech stack

- **Vanilla HTML / CSS / JS** — no build step, no framework. Chosen for speed and zero tooling friction.
- **PWA**: Service Worker + Web App Manifest
- **Storage**: `localStorage` for simple state, `IndexedDB` for logs (via a thin wrapper)
- **Font**: Space Grotesk (Google Fonts, loaded at runtime — cached by SW for offline)
- **No dependencies** — ship a single `index.html` + assets

---

## File map

```
festival/
├── CLAUDE.md          ← you are here
├── PRD.md             ← product requirements (authoritative)
├── DESIGN.md          ← design decisions (authoritative)
└── accueil.html       ← design prototype: Boussole home screen
```

The `accueil.html` file is a **design prototype only** — it contains no logic. The real app will be built from scratch as a proper PWA.

---

## Design tokens (from DESIGN.md)

```css
--bg: #0F0E17
--surface: #1A1A2A
--primary: #FFBE0B      /* solar yellow — brand */
--water: #3DDBD9        /* teal — hydration */
--electrolyte: #A78BFA  /* purple — electrolytes */
--substance: #FF6B6B    /* coral — substance entries */
--text: #FFFFFE
--text-muted: #8888AA
```

Dose badges: Léger `#06D6A0` · Commun `#FFBE0B` · Fort `#FF9F1C` · Lourd `#FF6B6B`

---

## Key product decisions

- **App name**: Boussole (compass). "You're navigating your night."
- **Languages**: FR and EN. Toggle lives in the **Info tab** (not on home screen).
- **Substances**: Ecstasy and MDMA are separate entries but share a cumulative MDMA-family pool for interactions and dose tracking. Full list in PRD.md.
- **LSD**: Tab and Goutte (drop) are route variants of the same substance — same timeline and cumulative counter.
- **No day concept**: the stream is a continuous timeline. Recent = bottom. Scroll up = go back in time.
- **Sticky action bar**: `+ Eau` and `+ Substance` buttons live just above the bottom nav on the **Boussole page only**. The RDR page has no action bar — it is a pure reference tab.
- **Buddy mode**: deferred — not MVP.
- **Push notifications**: deferred — not MVP.

---

## Navigation (bottom tab bar)

3 tabs — the Eau tab was removed; hydration is fully integrated into the Boussole home screen.

| Tab | Icon | Description |
|---|---|---|
| Boussole | 🧭 | Home: hydration card + full activity stream + action bar (`+ Eau` · `+ Substance`) |
| RDR | 🎊 | Substance reference hub: card grid → info drawer (effects, duration, doses, risks). No timeline, no logging. |
| Info | ℹ | Lang toggle · emergency contacts · sources · about · clear data |

---

## The Stream (core UI metaphor)

- Vertical timeline. **Oldest at top, newest at bottom.**
- Left side: an **animated sine wave** drawn on canvas, flowing downward toward "now". The wave's amplitude is ~11 px around a center axis; it animates at a slow continuous speed so it feels alive.
- Dots ride the wave at each entry's y-position, colored by type: teal (water), purple (electrolytes), coral (substances). Each dot has a glow ring + specular highlight.
- The wave itself is teal, with a gradient from near-invisible at the top to bright and glowing at the bottom. A glowing "now" tip pulses at the very bottom.
- Time separators (e.g. "aujourd'hui · 19h") divide chunks of time — not calendar days.
- Tap entry → detail sheet with note field.

---

## Add flows

Both water and substance adds use a **bottom sheet** that slides up. The two sheets share the same visual language: identical grid layout for presets, same time selector, same confirm button.

**Water** (single step):
- Type toggle at top: Eau | Électrolytes (switches the preset grid)
- Amount presets (250 ml / 500 ml / 750 ml / 1 L / Autre)
- Electrolyte presets (1 sachet / 2 sachets / 1 comprimé / Poudre / Autre)
- Time: Maintenant | Autre heure
- Confirm (disabled until amount selected)

**Substance** (2 steps):
1. Pick substance from grid (Alcool, Cannabis, Ecstasy, MDMA, Kétamine, Cocaïne, LSD, Champignons, Speed, 3-MMC)
2. Pick dose using category presets (Léger / Commun / Fort / Lourd) with mg detail per substance + Pick time → Confirm → interaction check

---

## What to build next (suggested order)

1. `index.html` — PWA shell: manifest link, SW registration, bottom nav routing (hash or simple JS)
2. Data layer — `storage.js`: read/write logs to IndexedDB, schema for water and substance entries
3. i18n layer — `i18n.js`: FR/EN strings object, toggle persisted to localStorage
4. **Boussole screen** — hydration card with live data, full activity stream with animated wave, sticky action bar
5. **RDR screen** — full substance log + add-substance flow (multi-step sheet)
6. **Substance info pages** — one page per substance, bundled (data from PRD.md research)
7. **Info screen** — lang toggle, about, clear data
8. **SW + manifest** — offline caching, installability
9. **Interaction warnings** — check on every substance log, display inline
