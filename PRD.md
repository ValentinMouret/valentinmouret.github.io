# Boussole — Product Requirements Document

## Overview

**Boussole** (compass) — a mobile-first PWA for festival-goers and party attendees to track hydration and manage substance use safely. Full client-side, no server, no accounts. Works offline. Data lives on device.

**Tagline:** Your pocket companion for a good time, safely.

---

## Audience & Tone

- General public: festival-goers, party attendees
- **Solar, playful, non-judgemental, colorful**
- Factual but not clinical, reassuring not preachy
- Assumes adults making their own choices; the app's job is to help them do so safely

---

## Languages

- French and English
- Manual toggle via a flag button (FR/EN), persistent across sessions
- All copy — UI labels, drug info, warnings — available in both languages

---

## Technical Constraints

- **PWA**: installable on iOS and Android home screen
- **Offline-first**: full functionality with zero connectivity
- **No server**: all data stored in `localStorage` / `IndexedDB`
- **Service Worker**: ensures the app loads and runs without network
- Timers, countdowns, and state must survive app backgrounding and device sleep
- Data must persist across sessions

---

## Features

### 1. Hydration Tracking

**Goal:** Help people stay hydrated without overdrinking (hyponatremia risk). Fun and forgiving — not a chore.

#### MVP

- **Log water intake** — retrospective: pick amount (presets: 250ml, 500ml, 1L, or custom) and time (now / time picker)
- **Status banner on home screen** — context-aware message when opening the app:
  - Normal: "Last drink: 1h30 ago. You're doing well 🌊"
  - Nudge: "It's been 3 hours — did you have some water?"
  - Warning: "Almost 5 hours with no water logged. Drink something!"
- **Electrolyte nudge** — after every ~1.5L logged, a contextual reminder: "Don't forget some salt or electrolytes too"
- **Log list** — simple chronological list of all logged intakes

#### Later

- Push notifications / reminders (requires notification permission, nice-to-have)
- Daily hydration goal with visual progress

---

### 2. Substance Tracking (Harm Reduction / RDR)

**Goal:** Non-judgemental logging of substance intake. After logging, surface relevant safety info and interaction warnings.

#### Supported Substances (MVP)

- Alcool
- Cannabis
- **Ecstasy** (pressed pills, unknown purity — warn accordingly)
- **MDMA** (powder/crystals, assumed pure — separate entry from Ecstasy)
  - Ecstasy and MDMA are distinct entries but the app treats them as the same family for cumulative dose tracking and interaction warnings
- Kétamine
- Cocaïne
- LSD
- Champignons (Psilocybine)
- Speed (Amphétamine)
- 3-MMC

#### Per-Substance Information Page (bundled, offline)

Content sourced from [Psychonautwiki](https://psychonautwiki.org), adapted for tone. Each page includes:

- **Effects** — what to expect
- **Onset / duration** — how long before it kicks in, how long it lasts
- **Dosage ranges** — light / common / strong / heavy
- **Risks** — what to watch for
- **Known interactions** — which combinations to avoid and why
- **Link to source** — Psychonautwiki page (for when there's signal)

#### Logging Flow (MVP)

1. User selects substance
2. User enters dose (optional, with unit) and time (default: now)
3. App confirms: "Noted. Stay safe." + shows:
   - Quick summary of effects and expected duration
   - Link to full info page
   - Interaction warnings if other substances were logged recently (e.g. ketamine + alcohol logged within 12h → warning)

#### Log View

- Timeline of all logged intakes
- Per-entry: substance, dose, time, "X hours ago", estimated duration remaining
- Tap to see full info page

#### Interaction Logic

- When logging a new substance, check the last 12h of the log
- If a known dangerous combination is present, show a prominent (but calm) warning
- Warning copy: factual, non-alarmist, actionable ("Mixing ketamine and alcohol increases the risk of losing consciousness. Consider spacing them out.")

#### Later

- More substances
- "What to do if it goes wrong" per substance
- Emergency contacts / festival medic info

---

### 3. Buddy Mode

**Goal:** One phone can track multiple people. Useful for sober volunteers, group coordinators, or friends watching out for each other.

#### Later (not MVP)

- Create named profiles on the device (no sync, no accounts)
- Switch active profile from a persistent top bar
- Each profile has independent hydration logs and substance logs
- Visual indicator of whose data you're viewing

---

### 4. Boussole Screen (Home)

**MVP layout:**

- Logo only in top bar (no lang toggle here — lang is in Info tab)
- Hydration status card (contextual message, total today, take count, electrolyte status, wave animation background)
- **Full activity stream** — all entries (water + electrolytes + substances), chronological, oldest at top, newest at bottom. Animated sine wave timeline along the left edge.
- **Sticky action bar just above the nav** — two solid-colored buttons: `+ Eau` and `+ Substance`. Always visible, thumb-reachable.

There is no separate Eau page — hydration logging and the hydration log are both on this screen.

---

## MVP Scope (Shipping Today)

| Feature | Included |
|---|---|
| PWA installable | ✅ |
| Offline support (Service Worker) | ✅ |
| Data persistence (localStorage) | ✅ |
| FR / EN toggle | ✅ |
| Hydration log (retrospective) | ✅ — on Boussole screen |
| Hydration status on home | ✅ |
| Electrolyte nudge | ✅ |
| Substance log | ✅ |
| Drug info pages (bundled) | ✅ — core substances |
| Interaction warnings on log | ✅ — key combos |
| Animated wave timeline | ✅ |
| Push notifications | ❌ later |
| Buddy mode | ❌ later |
| Daily hydration goal | ❌ later |

---

---

## Dose Input Design

### Principles

- Route selection first when route dramatically changes dose (ketamine, cocaine, speed, 3-MMC)
- Friendly presets with cultural unit names + mg/g equivalent shown
- Each preset shows a **dose category badge**: léger / commun / fort / lourd (color-coded)
- "Autre" (other) always available for custom numeric entry
- Warn on high doses in-context, without being preachy

### Per-Substance

#### Ecstasy / MDMA
- Listed in the UI as **Ecstasy (MDMA)** — ecstasy is the name people know at festivals; MDMA is shown as clarification
- Route: Oral (only)
- Presets: ½ taz (~60 mg) · 1 taz (~120 mg) · 2 taz (~240 mg) · Autre
- Dose ranges: light <80 mg · common 80–120 mg · strong 120–150 mg · heavy 150+ mg
- Redose warning: flag if a redose is logged <3h after the first

#### LSD
- Route selector: **Tab** / **Goutte (drop)**
  - Tab presets: ½ tab (~50 µg) · 1 tab (~100 µg) · 2 tabs (~200 µg) · Autre
  - Goutte presets: 1 goutte (~100 µg) · 2 gouttes (~200 µg) · Autre
- Both routes log to the same LSD timeline and cumulative dose counter — "tab" and "goutte" are just intake formats, same substance
- Dose ranges: light 15–75 µg · common 75–150 µg · strong 150–300 µg · heavy 300+ µg
- Duration: 8–12h — show countdown in log

#### Psilocybin (Champignons)
- Route: Oral (only)
- Presets: 0.5 g · 1 g · 2 g · 3.5 g · Autre
- Dose ranges (dried cubensis): light 0.5–1 g · common 1–2.5 g · strong 2.5–5 g · heavy 5+ g
- Show psilocybin mg equivalent next to preset

#### Cannabis
- Route selector: Fumé / Comestible
- Fumé presets: ¼ joint · ½ joint · 1 joint · Autre (grams)
- Comestible presets: 5 mg THC · 10 mg · 20 mg · Autre
- Edible warning: onset 20–60 min — nudge not to redose too early

#### Alcool
- Route: Oral (only)
- Presets: 1 verre · 2 verres · 3 verres · Autre
- 1 standard drink = 10 g ethanol (French standard)
- Dose ranges: light 1–2 drinks · common 3–4 drinks · strong 5–6 drinks · heavy 7+

#### Kétamine
- Route selector: Sniffé / Oral
- Sniffé presets: 1 bump (~40 mg) · 2 bumps (~80 mg) · Autre
- Oral presets: 100 mg · 200 mg · 300 mg · Autre
- Dose ranges (sniffé): light 10–30 mg · common 30–75 mg · strong 75–150 mg · heavy 150+ mg

#### Cocaïne
- Route selector: Sniffé / Fumé
- Sniffé presets: 1 ligne (~50 mg) · 2 lignes · Autre
- Dose ranges (sniffé): light 10–30 mg · common 30–60 mg · strong 60–90 mg · heavy 90+ mg
- Compulsive redose warning after 3rd log in 2h

#### Speed (Amphétamine)
- Route selector: Oral / Sniffé
- Oral presets: ~25 mg · ~50 mg · ~75 mg · Autre
- Sniffé presets: ~20 mg · ~40 mg · Autre
- Dose ranges (oral): light 5–10 mg · common 10–25 mg · strong 25–50 mg · heavy 50+ mg

#### 3-MMC
- Route selector: Oral / Sniffé
- Oral presets: 75 mg · 150 mg · 250 mg · Autre
- Sniffé presets: 30 mg · 60 mg · 100 mg · Autre
- Dose ranges (oral): light 50–150 mg · common 150–250 mg · strong 250–350 mg · heavy 350+ mg
- Compulsive redose risk: flag after 2nd log

### Dose Category Colors (consistent across app)
- **Léger** — soft green
- **Commun** — soft yellow
- **Fort** — soft orange
- **Lourd** — soft red (not alarming, just a cue)

---

## Dangerous Combination Matrix

Show a warning when two substances with dangerous interaction are both logged within 12h.

| Combo | Risk Level | Short warning |
|---|---|---|
| Alcool + Kétamine | 🔴 Très dangereux | Risque de perte de conscience |
| Alcool + MDMA | 🟠 Dangereux | Augmente la déshydratation et la toxicité |
| Alcool + Cocaïne | 🔴 Très dangereux | Forme de la cocaéthylène, risque cardiaque |
| Alcool + GHB/GBL | 🔴 Fatal | Dépression respiratoire |
| MDMA + Speed | 🔴 Très dangereux | Surtension cardiovasculaire et neurotoxicité |
| MDMA + Cocaine | 🔴 Très dangereux | Surtension cardiovasculaire |
| MDMA + 3-MMC | 🔴 Très dangereux | Syndrome sérotoninergique potentiel |
| Cannabis + LSD | 🟠 Dangereux | Potentialise fortement l'expérience |
| Cannabis + Champignons | 🟠 Dangereux | Potentialise fortement l'expérience |
| Kétamine + Autres dissociatifs | 🟠 Dangereux | Amnésie et sédation renforcées |

---

#### Ecstasy dose note
Ecstasy pills have highly variable content. The dose input should surface this prominently: "La composition exacte d'un cachet est inconnue. Utilise un test si possible." Presets are labelled as approximations.

#### MDMA (poudre / cristaux)
- Same dose ranges as Ecstasy but framed as more reliable since user sourced crystals
- Same cumulative tracking as Ecstasy (MDMA-family pool)
