# Blitzmire UI Design System

> **Status: DIRECTION APPROVED, implementation not started.** Section 1's
> five findings were accepted as the baseline audit. The five direction
> decisions below are now settled; what's still open is the CONCRETE visual
> design that satisfies them — being tested right now via one prototype
> screen (Building Upgrade, `docs/ux/building-upgrade.md`) before any
> component gets built or any existing file changes. See **Open Decisions**
> at the bottom for what's still genuinely undecided.

## Authority

1. **CLAUDE.md** — hard constraints, the VISUAL STYLE palette, BUILDING
   VISUAL GUARDRAILS, RENDERING LAYERS, CODE RULES. Non-negotiable.
2. **ARCHITECTURE.md** — current real state of the game. Non-negotiable.
3. **This document** — the UI-specific rules layer: panel hierarchy,
   component taxonomy, interaction patterns, motion language. Must never
   contradict 1 or 2; where it's silent, CLAUDE.md's general rules apply.
4. **`src/config/*.js`** — the actual token values. This document
   **references** config fields by name; it does not restate their numbers.
   If a value here and the config ever disagree, the config is correct and
   this document is stale — fix the doc, not the code, unless the code is
   what's wrong.
5. **Figma** (future) — visual reference only. See **Figma Workflow** below.

---

## 1. Visual Identity

### The actual problem, found in the code, not assumed

Blitzmire's UI is not under-themed. It's two things at once, neither of
which is "a WWII military interface, confidently rendered":

**Finding A — two unreconciled skins.** `WORLD_HUD` (`HudConfig.js`) and
`MENU`/`BUILDING_MENU` (`MenuConfig.js`, `BuildingMenuConfig.js`) are a
cool "glass/steel" language — near-black grounds (`0x14140f`, `0x0a0a08`),
white/silver strokes (`0xe4e5e6`, `0xffffff`), explicitly documented in
`HudConfig.js` as replacing an "old gold theme." `TroopMenuTheme.js`
(`TROOP_MENU`) is a separate warm olive/brass language — its own bg/panel/
brass/ink tokens, used by `UnitsMenu` and `TroopDetailScreen` for the
background surface only; those same screens still pull text/icon color
from `WORLD_HUD` (`accentColor`, `dimColor`, `textColor`). The result is a
**blend, not a choice** — Army/Units screens are olive-surfaced but
steel-lit, HUD/Building screens are steel throughout.

**Finding B — the chrome's base recipe is a generic one.** Per
`frontend-design`'s own calibration list, "a near-black background with a
single bright accent" is a named default pattern that reads as
AI-generated regardless of subject matter. `WORLD_HUD`'s actual structure
— near-black ground + one bright-white accent (`accentColor: 0xffffff`) +
small scattered semantic dots (olive confirm, combat-orange warnings,
gold stars/power) — matches that recipe structurally. **CLAUDE.md's real
palette** (saturated olive greens `#4B6B1F`/`#5C7A29`/`#6F8F35`, warm
earth browns, steel-but-colorful metal greys, mandatory hazard/tarp/
insignia accents) is barely present in the chrome itself — it shows up
almost nowhere except `ARMY_MENU.trainColor` (`0x4b6b1f`, a real CLAUDE.md
green) and scattered state colors. The game's own art bible is not what's
structuring its panels.

**Finding C — token drift, not just duplication.** `WORLD_HUD.panel` and
`MENU.panel` are two independent definitions of the *same* "scrim + card"
shape (see Finding under Component System below) that have already
drifted: scrim alpha `0.86` vs `0.78`, card bg `0x1b1b12` vs `0x14140f`.
Neither is "more correct" — they just disagree, silently, right now.

### What "recognizably Blitzmire" should mean

Not a new palette. CLAUDE.md's palette is already right and already
mandatory — the fix is **using it as structure, not just as accent**:

- A panel's **ground** material (dark steel/glass per the current
  WORLD_HUD language) stays — that's a legitimate "command-post at night"
  register and shouldn't be thrown out.
- A panel's **one emphasis move** per screen should come from CLAUDE.md's
  actual accent kit (hazard yellow/black, tarp blue, insignia white, or
  the saturated greens/earth) rather than defaulting to white-on-black
  every time. `StatMedallion`'s ringed-circle treatment (`StatMedallion.js`)
  is the right instinct already — ONE bold, specific thing per screen,
  everything else quiet — apply that principle to color, not just shape.
- **Fix the token drift** (Finding C) by making `MENU.panel` and
  `WORLD_HUD.panel` the same object, or deleting one in favor of the other
  — not a design decision, a bug. **Deferred** (see Open Decisions): don't
  merge them yet — merging now would lock in whichever of the two generic
  values happens to win, before the new shared panel system (below) has
  been designed.

### DECIDED — one coherent component language (2026-10-04)

**Blitzmire does not get two UI skins.** Steel/glass and olive/brass are
**contextual material variants of one underlying language**, not two
separate design systems. The following seven axes are shared across every
screen regardless of material context — a troop screen and a building
screen must agree on all seven, and only "which material/accent is this
surface drawn in" is allowed to vary:

| Shared axis | What stays constant across material contexts |
|---|---|
| **Hierarchy** | The same Panel Hierarchy + Elevation tiers (§2) — a troop detail screen and a building upgrade screen at the same tier read as the same *kind* of surface. |
| **Proportions** | One spacing system (proposed below), not independently hand-tuned per screen. |
| **Interaction language** | One tap/press/drag/dismiss vocabulary (§6 Mobile UX, §7 Motion) — already mostly consistent; keep it that way deliberately now. |
| **Typography logic** | One named type scale (proposed below) — not matching sizes by eye per screen. |
| **Depth logic** | The Elevation rule (§2) — "more separation the more a surface interrupts," applied identically regardless of material. |
| **Button language** | One button family (primary / secondary / icon — see Component System "Improve") with states (normal/disabled/locked) defined once. |
| **Spacing system** | Same proposed grid as Proportions — one number line every screen's padding/gaps snap to. |

**What's allowed to vary by material context:** ground color/texture
register (steel/glass vs. olive/brass), accent color pulled from CLAUDE.md's
kit, and icon/ornament style appropriate to that context. Nothing else.

**Proposed starting scales** (to be validated by the Building Upgrade
prototype before they're treated as locked — see Open Decisions):

- **Spacing grid**: base 4px — `4 / 8 / 12 / 16 / 20 / 24 / 32`. Chosen
  because most existing `padPx`/`gapPx` values across the audited configs
  already cluster near multiples of 2 or 4; this formalizes that instinct
  into one explicit scale instead of per-screen hand-tuning.
- **Type scale** (named roles, not just sizes): `Display` (screen/section
  titles, ~20-23px today), `Headline` (the one focal number on a screen,
  e.g. a medallion value), `Label` (section eyebrows, stat labels,
  ~10-13px today), `Body` (descriptions, ~12-13px today), `Micro`
  (badges, captions, ~9-11px today). Every text element on a screen maps
  to one of these five roles — no sixth size invented ad hoc.

### Branding restraint

Blitzmire's wordmark/logo does **not** appear on gameplay screens — no
persistent branding on the HUD, building screens, army/troop screens, or
any contextual panel. Brand/logo treatment is reserved for contexts the
player enters deliberately and briefly: the loading screen, a future
title moment, and major top-level navigation chrome — never on a screen
the player is actively *using*. The interface becomes recognizable as
Blitzmire through the visual language itself (palette discipline,
hierarchy, the elevation system, the button/type/spacing consistency
above) — not through a logo stamped on every panel.

### Avoid

- A generic "corporate/SaaS" surface: identical rounded-card treatment
  applied to everything regardless of hierarchy (see Component System —
  every card in the game currently uses roughly the same 6-10px radius +
  1-1.5px light stroke recipe; that sameness is fine for peer-level items,
  wrong when it flattens a primary action and a cost chip to the same
  visual weight).
- Tracked-out ALL-CAPS section eyebrows as a default (`BuildingUpgradeContent`'s
  "FEATURES UNLOCKED" / "MATERIAL COST" / "RESOURCE COST" are exactly this
  pattern) — it's a named generic-UI tell, not automatically wrong, but it
  should be a deliberate choice for *this* screen, not the reflexive label
  treatment for every section header in the game.
- More borders, more shadows, more decoration as the fix for "feels
  generic." It isn't — see Visual Identity above. Composition and material
  honesty fix this; ornament doesn't.

### Token references (do not duplicate these values — point at them)

| Property | Source of truth |
|---|---|
| Corner radius | per-surface `*radiusPx` fields across `HudConfig.js`/`BuildingMenuConfig.js`/`BuildingScreenConfig.js`/`MenuConfig.js` — no single global radius exists today; seeing them side by side is how Finding C—style drift gets caught early |
| Borders/strokes | `*stroke`/`*strokeWidthPx`/`*strokeAlpha` fields, same files |
| Surface/depth hierarchy | `LayerConfig.js` `LAYERS` (render order) is the *only* real depth system today; there is no separate elevation/shadow system — see Open Decisions |
| Shadows/highlights | `StarRow.js`'s drop-shadow stars and `RELOCATE_ARROWS`'s rim+shadow (`BuildingMenuConfig.js`) are the only two places with a real shadow treatment; everything else is flat fill + stroke |
| Opacity levels | `*Alpha`/`disabledAlpha`/`lockedAlpha` fields, scattered per-config |
| Animation durations | see **Motion Language** below — this document *does* name the real values, because right now they're scattered with no index |

---

## 2. Panel Hierarchy & Elevation

Six levels (L0 and L5 added to the first pass — both explained below), distinguished structurally
by **world vs. screen anchor**, **scrim vs. none**, and **dismissal
gesture** — not by size. Always-on persistent chrome (`TopBar`, `NavBar`,
`SquadBar`) didn't have a level in the first pass; it's L1 here, distinct
from the contextual controls that only appear on selection.

| Level | Identity | Examples |
|---|---|---|
| **L0 — World** | The game itself. No chrome. | the map, 3D buildings/units |
| **L1 — Persistent HUD** | Always on screen, screen-anchored, no scrim | `TopBar`, `NavBar`, `SquadBar` |
| **L2 — Contextual controls** | Appears on selection, world- or screen-anchored, no scrim, transient | `BuildingHexMenu`, `BuildingPanel` |
| **L3 — Major gameplay screen** | Screen-anchored, edge-docked or full-screen, integrated with L1 (no scrim), persists until explicit action | `ArmyMenu`, `BuildingUpgradeScreen`, `UnitsMenu`, `TroopDetailScreen` |
| **L4 — Secondary detail/modal** | Screen-anchored, centered, scrim, tap-outside closes, can drill to another L4 | `BuildingInfoScreen`, `BuildingLevelInfoScreen` |
| **L5 — Critical confirmation** | *Not built yet.* Reserved for irreversible/consequential choices only | none today |

(Note: this collapses the original L4/L5 split from the first pass into
one L3 — both "edge-docked major panel" and "full-screen interface" turned
out to share the same elevation behavior below, which is the property
that actually matters; they still differ in footprint, which stays a
content decision, not a hierarchy one.)

**Classification rule:** (1) world- or screen-anchored? (2) does it need a
scrim? (3) can an accidental outside tap cost the player anything? — not
eyeballing which existing screen it "feels like."

### Elevation rule (decided — see Open Decisions for what's still being
validated)

**Elevation tracks how much a surface interrupts the player's current
context — not how big it is.** A full-screen L3 and a small L4 modal can
each warrant more or less visual separation; what sets it is whether the
surface is an *integrated extension* of what's already on screen or an
*interruption on top of it*.

| Level | Elevation treatment |
|---|---|
| L0 | None — it's not a panel. |
| L1 | Minimal — thin stroke, translucent ground, no shadow. Always visible; must recede, not compete with the world. |
| L2 | Low — a soft contact shadow or backdrop blur (`BuildingHexMenu` already does this) to read as "just lifted off the map," answering one specific tap. |
| L3 | Moderate — a visible but restrained separation (stroke + subtle edge treatment). Reads as *part of the interface*, because it's docked/integrated with L1, not floating above it. |
| L4 | Strong — full scrim + a real cast shadow/stronger stroke. It's a genuine interruption demanding focus; the elevation should say so. |
| L5 | Strongest — darkest scrim, strongest shadow, smallest/most-centered footprint, once this tier is actually needed. Reserve the strongest treatment in the whole system for the rare case that's actually irreversible or consequential — if everything is this loud, nothing is. |

**Restraint rule:** within any one screen, at most ONE element gets
elevation treatment stronger than its tier calls for (the `StatMedallion`
move — one standout, everything else quiet). Elevation is a hierarchy
signal, not a decoration — a screen where every card floats and casts a
shadow has the same "generic SaaS" problem named in §1, just with shadows
instead of borders.

---

## 3. Reusable Component System

### Keep — already correct, promote by name

| Component | File | Why it's right |
|---|---|---|
| `StarRow` | `src/ui/hud/StarRow.js` | Shared verbatim by `UnitCard` + `TroopDetailScreen` — real procedural stars with drop shadow, one visual source, not two. |
| `StatMedallion` | `src/ui/hud/StatMedallion.js` | Exactly the "one bold emphasis, everything else quiet" principle (Visual Identity) applied correctly — the model for how a screen's single standout element should look. |
| `ScrollDrag` | `src/ui/hud/ScrollDrag.js` | Shared scroll + camera-pan-suppression behavior across `UnitsMenu`/`TroopDetailScreen`/`BuildingLevelInfoScreen` — mandatory for any new scrollable surface. |
| `*IconDraw.js` functional convention | `src/ui/hud/*IconDraw.js` | Every icon drawer shares one signature — `(g, cx, cy, r, color) => void`, pure, pooled-graphics-friendly. The convention is good; only the per-domain file split (Nav/Building/Army/Stat/TopBar/UnitClass/Map/Action) is fragmented — a lookup registry, not a rewrite, would help. |
| `Button`/`Toggle`/`Slider`/`SegmentedControl` | `src/ui/controls/` | Consistent `view`/`enable`/`disable`/`setPosition` contract, config-driven, GSAP-animated per `MenuConfig.js`. Keep as the base control kit. |
| `armyShellRect()` | `src/config/ArmyMenuConfig.js` | Already the right idea — one shared sizing formula so `ArmyMenu` and `BuildingUpgradeScreen` can never silently drift apart. Promote to a named contract (see §5) rather than "a function `BuildingUpgradeScreen` happens to call." |

### Improve — exists, but duplicated or drifted

| Candidate | Problem found | Where |
|---|---|---|
| **`ModalShell`** | Four independent hand-rolled implementations of "scrim + centered rounded card + title": `NavPanel`, `BuildingInfoScreen`, `BuildingLevelInfoScreen` (all three read `WORLD_HUD.panel`), plus `SettingsScreen`/`SettingsDraw.js` (reads a *separate*, already-drifted `MENU.panel` — Finding C). One shell, one token source, parameterized by width/height/scrollable. |
| **`IconButton`** (close / info) | The small square "glass" icon button is hand-painted independently 3x: `BuildingInfoScreen`'s `paintRoundBtn`, `BuildingUpgradeScreen`'s inline header paint, `BuildingLevelInfoScreen`'s inline paint — all three borrowing `WORLD_HUD.navBar` tokens out of context. Consolidate to one component, and fix the touch-target gap (below) while doing it. |
| **Rect hit-test helper** | A private `within(r, sx, sy)` function is copy-pasted verbatim in `BuildingInfoScreen.js`, `BuildingUpgradeScreen.js`, `BuildingLevelInfoScreen.js`. Move to a shared util. |
| **`MajorPanelShell`** | `armyShellRect()` shares the *math*, but `ArmyMenu` and `BuildingUpgradeScreen` still each hand-draw their own `bg.clear().roundRect(...).fill().stroke()` reading the same `ARMY_MENU` tokens separately. Share the paint, not just the formula. |
| **Radial/fan menu primitive** | `BuildingHexMenu` (+`BuildingHexOption`) and `RadialMenu` (+`RadialOption`) are two independently-built "options fanned around an anchor point, GSAP stagger scale-in" systems, with separate configs (`BuildingMenuConfig` vs `OrdersConfig.radial`). Lower priority — both work — but a third fan menu should reuse one of these, not invent a third implementation. |

### Missing — don't exist yet, should

| Candidate | Gap it closes |
|---|---|
| **`PanelHeader`** | Every screen composes its own title/level/close/question-mark header layout by hand with slightly different spacing math (`BuildingInfoScreen`, `BuildingUpgradeScreen`, `BuildingLevelInfoScreen`, `UnitsMenu`, `TroopDetailScreen` all differ slightly). One header composition, parameterized by which optional elements are present. |
| **`StatRow`** (and its tile variant) | `BuildingInfoScreen`'s stat rows, `BuildingUpgradeContent`'s feature tiles, and `BuildingCostSections`' material/resource rows are three separately-coded icon+label+value renderers with overlapping layout math. One parameterized primitive (row vs. tile, color-by-affordability) covers all three. |
| **`LevelBadge`** | "Level" renders as a differently-formatted plain string in every screen that shows one — `BuildingPanel` ("L2"), `UnitCard` ("Lvl 1"), `BuildingUpgradeScreen` header ("Lvl N »»» N+1"), `TroopDetailScreen` ("Level N/Cap"). A shared badge fixes both the visual and copy inconsistency. |
| **Documented locked/disabled paint pair** | The locked-vs-can't-afford *data* distinction is already correctly modeled (`BuildingUpgradeContent._trueMax`/`_hqGated`/`_canUpgrade`) but each button redefines its own locked-grey and dimmed-alpha recipe. Not a new class — a documented rule every actionable component follows: *locked* = neutral grey override; *disabled/unaffordable* = same brand color, lower alpha. |
| **`NotificationBadge`** | Doesn't exist anywhere yet (no counter/badge on nav tabs or elsewhere). Don't build speculatively — add it to this table as a placeholder for whenever a feature first needs one, so it's designed once, not per-feature. |

---

## 4. Building UI — canonical interaction rule

**Tap building → L2 hex fan (info / upgrade / view / manage) → Info opens
an L4 modal, Upgrade opens an L3 panel.** The hex fan and the bottom bar
(`BuildingPanel`) are both L2 (contextual controls) but serve different
moments, not competing entry points: the fan is for the fresh decision
right after the tap; the bar is the *sustained-selection* companion that keeps
Upgrade (the highest-frequency action) reachable while the player does
other things on the map with that building still selected. Info/View/
Manage stay fan-only — one-shot lookups don't need persistent access.

**Info screen priority order** (already correctly built in
`BuildingInfoScreen` — codify, don't change): identity (name + level) →
current behavior (short description) → current-level numbers only. Never
a Max Storage row, never a collect/claim action — production is
continuous and passive; there is nothing to claim. The "?" drill-down
(`BuildingLevelInfoScreen`'s full level table) is secondary, for a curious
player, not part of the primary read.

**Upgrade screen priority order** (already correctly built in
`BuildingUpgradeScreen`/`BuildingUpgradeContent` — codify, don't change):
1. the transition itself as the header — "Lvl N »»» N+1" *is* the framing,
   not a caption under it; 2. FEATURES UNLOCKED as deltas only, never
   next-level totals, because the delta is the direct answer to "why
   upgrade"; 3. cost (materials, then core resources, shortfalls in red);
   4. one commit action whose three visual states (locked / disabled /
   normal) encode gating, affordability, and readiness without extra copy.
   No duration field belongs anywhere here — upgrades are instant; design
   for that fact, don't leave room for a mechanic that doesn't exist.

---

## 5. Army Screen → `MajorPanelShell` Contract

Promote `armyShellRect()`'s guarantee into a named shell any future
right-docked L3 panel can claim:

**Shell properties (shared):** dock edge (right), top safe-area inset
(clears `TopBar`), and the width/height-fitting formula that guarantees
pixel-identical outer bounds across occupants — this triad is what
`armyShellRect()` already computes; it just isn't named or reused as a
*contract* yet (see Component System, "Improve").

**Content properties (per-screen, never promoted into the shell):** row
count/height, whether the body scrolls (`ArmyMenu`'s rows can;
`BuildingUpgradeScreen` deliberately never does — both are valid, it's a
content decision), header composition (use `PanelHeader` once it exists),
internal padding rhythm, and dismissal behavior — tap-outside-closes is
common to both today but is an L3-class default (§2), not a shell
guarantee; a future L3 panel with real multi-step state is free to
require an explicit close per the Mobile UX dismissal rule below.

---

## 6. Mobile UX

- **Touch target floor: 44px hit area**, matching the precedent already
  set by `ScreenSafeArea`/`screenSidePad`. **Found below floor today:**
  `BuildingInfoScreen`'s "?"/"✕" and `BuildingUpgradeScreen`'s "?" and
  `BuildingLevelInfoScreen`'s "✕" are 24-28px. Fix direction: enlarge the
  invisible hit box to 44px; the glyph itself can stay visually small.
- **Dismissal rule:** tap-outside-closes when the surface is a
  single-purpose lookup/decision with no destructible state
  (`BuildingInfoScreen`, `BuildingLevelInfoScreen`, `BuildingUpgradeScreen`).
  Explicit-control-only when an accidental outside tap would cost the
  player real state — lost scroll position, lost tab, mid-multi-step
  progress (`UnitsMenu`, `TroopDetailScreen`). Test for any new screen: *if
  dismissing by accident costs the player something, require a button.*
- **One-handed landscape reachability:** keep every future L3 panel
  right-docked, matching `ArmyMenu`/`BuildingUpgradeScreen` — don't
  alternate sides screen to screen.
- **Information density:** "show only the decision-relevant number"
  (current-level-only in Info, delta-only in Upgrade) is the correct
  small-screen pattern. Full tables stay exclusive to explicit drill-downs
  (`BuildingLevelInfoScreen`) — never inline on a primary screen.
- **Accidental-touch prevention:** `ScrollDrag`'s gesture-claiming
  (suppresses map-pan under a UI drag) is correct and is mandatory for any
  new scrollable surface — don't hand-roll a second scroll gesture.
- **Fast navigation:** fixed docks that survive scrolling
  (`TroopDetailScreen`'s tab bar, `TroopUpgradeDock`'s pinned action) are
  correct — a primary action must stay one tap away regardless of scroll
  position.

---

## 7. Motion Language

The real values already in use, indexed here because nothing currently
collects them in one place (this is the one category this document names
directly rather than only pointing at config, since the point is to show
they already cluster into a sane system):

| Category | Real values in use today | Source |
|---|---|---|
| **Micro-feedback** (press, toggle) | ~90-150ms, `back.out(2)` spring or `power1.out` | `MENU.pressMs`/`springEase` (`MenuConfig.js`), `Toggle`'s `slideMs` |
| **Panel transition** (slide/fade in-out) | ~180-260ms, `power2.out` / `power2.in` | `NavPanel.slideMs`, `BuildingPanel.slideMs`, `WORLD_HUD.panel.slideMs`, `MENU.panel.enterMs` |
| **Fan/stagger reveal** (options appearing) | 180ms scale-in, 45ms stagger, `back.out(2)` | `BUILDING_MENU.scaleInMs`/`staggerMs`/`ease`, `ORDERS.radial` |
| **Value fill** (progress/bar) | ~220ms, `power1.out` | `MENU.loading.barFillMs` |

**Rule:** a new interaction reuses one of these four buckets by category
(what kind of thing is happening — a press, a panel appearing, a fan of
options, a value changing), not by picking a new duration that "feels
right." A genuinely new category needs a one-line justification in its
own config file, not a bespoke number buried in a component.

**Avoid:** per `frontend-design`'s own guidance — scattered hover/fade
effects on every element. Blitzmire's existing motion is already
restrained and purposeful (one transition per state change, nothing
decorative); keep it that way as new screens are built, don't add
per-element flourish.

---

## 8. Figma Workflow & Authority

**CODE = functional truth. This document = UI rules. Figma = visual
reference.** Concretely:

- Figma is never a second source of game logic, data, or state — nothing
  in a Figma file determines what a screen *does*.
- A Figma mockup feeds the **`ux-designer` agent** at spec time (`/ui-spec`)
  as a layout/structure reference — what's grouped with what, flow order
  — never as literal pixel values to replicate. `ux-designer`'s own
  definition (`.claude/agents/ux-designer.md`) already states this.
- **`ui-review`** checks a spec's fidelity to *this document* (panel
  hierarchy, component reuse, motion buckets, token references) — not
  fidelity to a Figma file's exact pixels. A Figma mockup that conflicts
  with this document loses; flag the conflict back to the mockup, don't
  silently follow it.
- **`ui-programmer`** never reads Figma directly — it implements the
  written spec (which has already absorbed whatever Figma reference was
  relevant) against Blitzmire's real PixiJS components and this document's
  component table.
- When this document and a Figma reference disagree on something
  genuinely undecided (not yet in CLAUDE.md or here), that's a design
  decision for the user, surfaced via `ui-review`'s NEEDS REVISION path —
  never resolved silently in either direction.

---

## Decision Log

**Resolved 2026-10-04:**
1. **Two-skin split** — rejected. One coherent component language across
   seven shared axes (§1, "DECIDED"); material/accent is the only
   context-variable. Steel/glass and olive/brass are variants, not
   separate systems.
4. **Depth/elevation** — a system now exists (§2, Elevation rule),
   graduated by interruption, not size, with a one-standout-per-screen
   restraint rule.
New: **Branding** — restrained; no persistent wordmark on gameplay
   screens; reserved for loading/title/major-nav contexts only (§1).

**Deferred, not resolved — waiting on the visual prototype:**
2. **Token drift fix** (§1, Finding C) — approved in principle, but
   `MENU.panel`/`WORLD_HUD.panel` must NOT be merged yet. Merging now
   would lock in today's generic values as if they were the new system.
   The Building Upgrade prototype (`docs/ux/building-upgrade.md`) is
   where the *replacement* shared panel system gets designed; the merge
   happens after that's approved, not before.
3. **Component consolidation order** — still not chosen. Architecture
   follows the approved visual system; the prototype comes first.

**Still genuinely open (unanswered):**
5. **ALL-CAPS section-eyebrow pattern** (§1, Avoid) — keep as a
   deliberate Blitzmire convention, or revisit as a generic-UI tell? The
   Building Upgrade prototype's "FEATURES UNLOCKED"/"MATERIAL COST"/
   "RESOURCE COST" headers make this concrete rather than abstract — see
   the prototype spec.

**New, pending prototype validation (§1 "DECIDED" section):**
6. The proposed 4px spacing grid and the five-role named type scale are
   *starting proposals*, not locked values — the Building Upgrade
   prototype is the first real test of whether they hold up on an actual
   screen. Treat them as provisional until that spec is approved.
7. **Power-as-headline-stat convention**: the prototype proposes using
   `StatMedallion` for Power specifically, conditionally, as the one
   cross-building "headline" stat (Power is the only stat common to all
   19 buildings). This is a new system rule, not just a choice for one
   screen — confirm or reject it as a standing convention when you review
   the prototype.

Nothing in `src/`, `CLAUDE.md`, or `ARCHITECTURE.md` has been implemented
or changed. See `docs/ux/building-upgrade.md` for the prototype this
direction is being tested against.
