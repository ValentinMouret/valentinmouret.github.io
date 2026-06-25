# Boussole — Design Decisions

## Identity

**Name:** Boussole (compass). You're navigating your night.
**Tone:** Solar, playful, non-judgemental, colorful, factual but not clinical.
**Audience:** Festival-goers and party attendees. Adults making their own choices.

---

## Color System — Ciel vivant

The app background is a living sky gradient that tracks the device clock. The sky cycles through the actual light conditions of a festival day — golden afternoon arrival, burning sunset, deep violet night, steel-blue dawn. This is the central visual metaphor: your screen reflects where you are in the day/night cycle.

### Sky keyframes

The JS sky engine interpolates linearly between these keyframes. All tokens are CSS custom properties set on `:root` and updated every 60 seconds.

| Hour | bg-top | bg-bot | Text mode |
|------|--------|--------|-----------|
| 0h   | `#050510` | `#120028` | Light on dark |
| 4h   | `#060614` | `#0E1A30` | Light on dark |
| 5h   | `#0E0D1E` | `#161428` | Light on dark |
| 6h   | `#FF9B5E` | `#FFD090` | Dark on light |
| 8h   | `#FFD6A5` | `#FFF0DC` | Dark on light |
| 12h  | `#FFF7E6` | `#FFFBF4` | Dark on light |
| 16h  | `#FFE5B4` | `#FFD580` | Dark on light |
| 17h  | `#C84418` | `#8E1840` | Light on dark |
| 18h  | `#B02C0C` | `#721036` | Light on dark |
| 19h  | `#FF7B4E` | `#C0327A` | Light on dark |
| 21h  | `#2D1B69` | `#0B0033` | Light on dark |
| 23h  | `#0F0820` | `#050510` | Light on dark |

**Contrast rule:** text color flips between dark-on-light and light-on-dark. The flip must always happen at a keyframe boundary, never in the interpolated space between two keyframes — otherwise both text and background pass through medium tones simultaneously and lose contrast. Always add an explicit keyframe for any hour that falls in a transition zone.

### Dynamic tokens

Set by the sky engine at runtime. CSS `:root` defaults correspond to the 23h keyframe (late night) so the app is always readable before JS runs.

| Token | Role | Night default | Day example |
|-------|------|---------------|-------------|
| `--bg-top` | Sky gradient top | `#0F0820` | `#FFF7E6` |
| `--bg-bot` | Sky gradient bottom | `#050510` | `#FFFBF4` |
| `--surface` | Glass card background | `rgba(20,10,40,0.55)` | `rgba(255,255,255,0.55)` |
| `--surface-raised` | Elevated/active surface | `rgba(35,18,60,0.40)` | `rgba(0,0,0,0.05)` |
| `--primary` | Brand accent | `#A78BFA` (violet) | `#CC6A00` (amber) |
| `--text` | Primary text | `#E8E0FF` | `#111008` |
| `--text-muted` | Secondary text | `#9090BB` | `#887060` |
| `--nav-bg` | Bottom nav background | `rgba(6,4,18,0.94)` | `rgba(255,252,244,0.94)` |
| `--border` | Surface borders | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` |

### Fixed tokens

These never change with the sky. They are the semantic accent colors for entry types and dose categories.

| Token | Value | Use |
|-------|-------|-----|
| `--water` | `#3DDBD9` | Water / hydration (always teal) |
| `--electrolyte` | `#A78BFA` | Electrolytes (always purple) |
| `--substance` | `#FF6B6B` | Substance entries (always coral) |
| `--dose-light` | `#06D6A0` | Léger dose badge |
| `--dose-common` | `#FFBE0B` | Commun dose badge |
| `--dose-strong` | `#FF9F1C` | Fort dose badge |
| `--dose-heavy` | `#FF6B6B` | Lourd dose badge |

### Glass surfaces

Cards use `backdrop-filter: blur(12–20px)` over the sky. The `--surface` token is a semi-transparent color whose opacity ensures enough contrast between the card and the sky beneath. Bottom sheets (add flows, substance info) use `var(--surface)` with `blur(24px)` — they follow the sky like everything else.

---

## Typography

**Typeface:** Space Grotesk (Google Fonts) — rounded, playful, legible at small sizes outdoors.
Fallback: `-apple-system, BlinkMacSystemFont, sans-serif`

| Role | Size | Weight |
|---|---|---|
| Logo | 22px | 700 |
| Section heading | 13px, uppercase, 1px tracking | 500 |
| Body / entry name | 15px | 500 |
| Detail / meta | 13px | 400 |
| Tiny label | 10–12px | 400 |

---

## Navigation

Bottom tab bar, 3 items: **Boussole · RDR · Info**
The Eau tab was removed — hydration is fully integrated into the Boussole home screen.
Active tab uses `--primary` (yellow). Inactive tabs use `--text-muted`.

---

## The Stream

The core metaphor for logs. Festival time is not calendar days — it's a continuous stream.

- **Vertical axis = time.** Bottom = most recent. Scroll up to go back in time.
- The left edge shows an **animated sine wave** drawn on canvas (36 px wide strip). The wave's axis is vertical; it oscillates left-right with ~11 px amplitude and flows continuously downward at a slow speed — time moving forward. Wave is teal, gradient from near-invisible at the top to bright and glowing at the bottom.
- Each entry is a dot that **rides the wave** at its y-position. Dot color = entry type (teal=water, purple=electrolytes, coral=substances), with a glow ring and specular highlight. A pulsing "now" tip anchors the bottom end.
- Stream entries show: name, detail (amount, dose category), relative time ("il y a 2h30").
- Tap an entry → detail sheet (shows full info + add a note).
- **Time-scrub interaction (log pages):** dragging on the timeline shows a time cursor. Lifting finger sets the timestamp for a new entry.

---

## Boussole Screen (Home)

- **Top bar**: logo only (compass SVG + "boussole" wordmark). No lang toggle here.
- **Hydration card**: contextual message (e.g. "2h30 sans eau — un petit verre ?"), total today, take count, electrolyte status. Animated wave shapes in the background. Tapping the card could open a detail view (future).
- **Full activity stream**: all entries (water + electrolytes + substances), oldest at top, newest at bottom. No "voir tout" — this IS the full log. The animated wave timeline runs along the left edge.
- **Sticky action bar** (above nav): two solid-colored buttons — `+ Eau` (teal `--water`) and `+ Substance` (lilac `#C084FC`). Always visible, thumb-reachable.

**Lang toggle lives in the Info tab**, not on the home screen.

---

## Icons

- **Boussole**: 🧭 compass
- **RDR**: 🎊 confetti / sprinkles — playful, non-clinical
- **Info**: ℹ

---

## Interaction Patterns

- **Add flow** (both water and substances): bottom sheet, slides up. Both sheets share the same visual language — identical preset grid, time selector, confirm button — so they feel like one design system.
- **Sticky action bar**: on Boussole and RDR pages — two buttons always visible above the nav, thumb zone. Tapping opens the add sheet for that category.
- **Interaction warning**: appears at the top of the RDR page (above the stream) when a dangerous combination is detected in the last 12h. Calm, non-alarmist, never blocks the user.
- **Dose category badge**: colored pill shown next to every substance dose (Léger / Commun / Fort / Lourd).
- **Route selector**: shown before dose presets when a substance has multiple routes with different dose ranges (Kétamine, Cocaïne, Speed, 3-MMC, Cannabis, LSD).
- **Substance info drawer**: on the RDR page, the "Substances" button in the action bar opens a two-step bottom sheet — (1) substance picker grid, (2) full info page for the selected substance (effects, onset/duration, dose ranges, risks, Psychonautwiki link). Back button returns to the picker. All data is bundled offline.

---

## Offline & PWA

- Service Worker caches all assets + substance info pages at install time.
- All data in `localStorage` / `IndexedDB`. Nothing leaves the device.
- Timers and countdowns use `Date`-based math on stored timestamps — survive backgrounding and reload.
- Install prompt handled gracefully (custom "Ajouter à l'écran d'accueil" banner).
