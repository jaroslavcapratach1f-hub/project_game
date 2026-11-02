# UX Spec: Building Upgrade Screen (Visual-Direction Prototype #1)

> **Status**: In Review — first prototype of the direction approved in
> `docs/ui/DESIGN_SYSTEM.md`. Nothing in `src/` has changed; this document
> is the target composition for `BuildingUpgradeScreen`/
> `BuildingUpgradeContent`, not a description of what's currently built
> (the Layout/Visual Notes sections mark exactly what's new vs. already
> correct).
> **Author**: ux-designer (structure) + orchestrating session (visual/
> material synthesis against `DESIGN_SYSTEM.md`)
> **Last Updated**: 2026-10-04
> **Platform Target**: landscape-primary mobile, touch only, no gamepad/
> keyboard, no localization system
> **Template**: UX Spec

---

## Purpose & Player Need

The player has just selected a building they're considering upgrading.
They need to answer one question — *is this worth it right now* — without
reading a wall of text: what changes, what it costs, whether they can
afford it, and whether anything is blocking it. The screen's entire job
is answering that question as directly as possible.

## Navigation Position

Per `docs/gdd/23-ux-navigation.md`'s persistent-HUD model: this is an L3
(major gameplay screen, §2 of `DESIGN_SYSTEM.md`) panel, docked right,
reached from an L2 contextual control while a building stays selected —
never a standalone destination.

## Entry & Exit Points

- **Entry**: tap building → `BuildingHexMenu` (L2) → "Upgrade"; **or** tap
  "Upgrade" on the persistent `BuildingPanel` bottom bar (L2) while this
  building remains the active selection.
- **Lateral**: the header's "?" opens `BuildingInfoScreen` (L4) — the
  existing cross-link, unchanged.
- **Exit**: tap anywhere outside the panel closes it, returning to the L2
  context (map + hex menu/bottom bar). A successful upgrade does **not**
  close the panel — it refreshes in place (existing, correct behavior).

## Layout

**Shell**: `MajorPanelShell` contract (§5 of `DESIGN_SYSTEM.md`) —
right-docked, pixel-identical outer bounds to the Army roster panel, no
scrim, never scrolls. Unchanged from today's `armyShellRect()`-driven
sizing.

**Zones** (top → bottom, fixed order and fixed proportion regardless of
building — only zone *contents* flex):

| Zone | Weight | Content |
|---|---|---|
| A. Header | ~12% | thumbnail, name, "Lvl N »»» N+1", "?" |
| B. Features Unlocked | ~33% | delta tiles; Power medallion leads when Power changes |
| C. Cost | ~35% | Material Cost row, then Resource Cost row |
| D. CTA | ~20% | UPGRADE button, bottom-anchored |

```
┌─────────────────────────────┐
│ [img]  Barracks          ?  │  Zone A — header
│        Lvl 7 »»» 8          │
├─────────────────────────────┤
│  FEATURES UNLOCKED          │  Zone B — focal point
│  ┌────────┐ ┌────┐ ┌────┐   │
│  │ POWER  │ │+120│ │+40 │   │  medallion leads only if Power changes
│  │ 1,240  │ │/hr │ │cap │   │
│  └────────┘ └────┘ └────┘   │
├─────────────────────────────┤
│  MATERIAL COST               │  Zone C
│  [card] [card]                │
│  RESOURCE COST                │
│  [$ 2,400] [steel 180] [oil 60]│
├─────────────────────────────┤
│         [   UPGRADE   ]       │  Zone D — bottom, flush above nav
└─────────────────────────────┘
         (persistent bottom nav, L1)
```

**Visual focal point**: Zone B (Features Unlocked), not the header and
not the button. The delta tiles are the only place "why upgrade" gets a
direct, concrete answer — the screen is built around that zone, not around
the transaction (cost/CTA), which stays functionally necessary but visually
secondary.

**Information hierarchy** (structural distinction, not color):
- **Tier 1**: Features Unlocked tiles — largest zone, sits directly below
  the header in primary reading position. The Power medallion (when
  present) is the single largest/most prominent element on the whole
  screen — reused `StatMedallion`, never more than one per screen.
- **Tier 2**: Material Cost, Resource Cost, UPGRADE button — full-width
  rows, read as a linear checklist, not a tile grid. Equal visual weight
  to each other.
- **Tier 3**: name/level transition, thumbnail, "?" — smallest type,
  smallest tap targets (at the 44px floor, never larger), live in one
  compact header strip. Wayfinding, not content.

**Current→next and delta-tile grouping**: "Lvl N »»» N+1" stays in the
header as the frame for the whole screen, never repeated inside each
tile. Tiles show delta values only (existing, correct — deltas answer
"why upgrade" directly; next-level totals would not). The header's "»»»"
arrow motif is the one directional cue; tiles don't need their own
repeated label.

**Building-visual placement (NEW — doesn't exist on this screen today)**:
a small thumbnail in the Zone A header row only, reusing
`BuildingInfoScreen`'s existing preview-swatch pattern (`buildingArt(id).tint`)
— not a new asset, not a dedicated zone. The player tapped this exact
building seconds ago; a large hero render would be redundant, and this
non-scrolling panel can't spare a zone for it without starving Features/
Cost. It answers "which building is this" at a glance if the panel is
reopened later (e.g. from a notification), at near-zero layout cost.

**Power-as-headline-stat (NEW convention — flagged at the system level,
Open Decision 7)**: `StatMedallion` (already built, already used on
`TroopDetailScreen`) renders Power **conditionally** — only when Power is
one of this upgrade's changing stats, and always as the lead tile. When
Power doesn't change, no tile gets medallion treatment; the zone's focal
strength comes from position/size alone. Power is the only stat common to
all 19 buildings, making it the sole legitimate candidate for a
cross-building "headline" convention — a building-specific stat (steel/hr,
troop capacity) is too contextual to standardize into a singular standout.
**Ring color: `WORLD_HUD.topBar.powerColor` (`0xffd23c`, CLAUDE.md's gold
family)** — already the established Power color in `TopBar`; reusing it
here keeps Power legible as "the same number" across the HUD, and is this
screen's one deliberate pull from CLAUDE.md's real accent kit rather than
defaulting to white-on-black (the exact gap named in `DESIGN_SYSTEM.md`
§1, Finding B) — this is the one place this screen is required to.

**Reused as-is**: `BuildingUpgradeContent`'s FEATURES UNLOCKED tile logic,
`BuildingCostSections` (Material/Resource Cost), `pickStatIcon`, the
`armyShellRect` shell, the three-state UPGRADE button logic.
**New**: the header thumbnail, the conditional Power medallion.
**Design System candidate** (not required before this spec ships — see
Component System "Missing" in `DESIGN_SYSTEM.md`): a shared `PanelHeader`
component would cover this header's thumb+name+transition+"?" pattern,
currently hand-built per-screen.

## States & Variants

| State | Treatment |
|---|---|
| Normal (affordable, not maxed) | UPGRADE button in brand color, full opacity |
| Disabled (can't afford) | Same brand color, dimmed (`btnDisabledAlpha`) — existing, correct |
| Locked — HQ-gated | Neutral grey, label explains why ("Upgrade Headquarters to Lvl X First") — existing, correct |
| Locked — true max | Neutral grey, "MAX LEVEL", Features Unlocked section replaced with "(MAX LEVEL)" label, no tiles — existing, correct |
| Loading | **N/A** — all data is local/synchronous (no network fetch backs this screen); do not add one |
| Error | **N/A** — no async failure path exists here; do not add one |
| Empty | **N/A** — a maxed building is the "Locked — true max" state above, not an empty state |

## Touch Interaction Map

- Thumbnail: not interactive — identity only.
- "?": **44px hit box** (up from today's 24px — Mobile UX floor, §6) →
  opens `BuildingInfoScreen`. Glyph stays visually small; only the
  invisible hit area grows.
- Feature tiles, cost cards/rows: not interactive — display only.
- UPGRADE button: full-width, `btnHeightPx` 44px — already compliant, no
  change needed.
- Dismissal: tap anywhere outside the panel closes it. No explicit close
  control — correct per the §6 dismissal rule: this screen has no
  destructible interactive state, so an accidental outside tap costs the
  player nothing.

## Data & Events

Reads: `BuildingConfig`, `BuildingStatsConfig`, `MaterialsConfig`,
`ResourceConfig` (existing, unchanged). Commit: `BaseManager.upgrade(id)`
(existing — validates cap/afford, deducts, applies atomically; this
screen adds no second validation path). Refresh: pull-based `refresh()`
on `RESOURCE_CHANGED` and post-upgrade completion — already event-driven;
UI never mutates state directly. No changes to any of this.

## Visual Notes

**Material context**: steel/glass (this is HUD/building chrome, not
troop-specific content) — per the two-skin resolution, this screen was
never blended with the olive/brass language, so no cleanup is needed
here; it's already in the correct context.

**Elevation**: L3 → **moderate** (§2). Stays docked flush against the
persistent HUD, no scrim — today's non-scrim treatment is already correct
under the new elevation rule; nothing structural changes. The one
exception the restraint rule allows: the UPGRADE button may carry a
slightly stronger edge treatment than the flat cost rows above it (it's
the single commit action and needs to read as *the* actionable item) —
but this is the only element on the screen allowed any extra weight
beside the Power medallion.

**Typography** (mapping existing sizes onto the proposed 5-role scale —
this mapping is itself the validation test for the scale, not a resize):
name/level header → **Display**; Power medallion value → **Headline**;
section titles (FEATURES UNLOCKED / MATERIAL COST / RESOURCE COST) →
**Label**; feature/cost text → **Body**; any badge/caption → **Micro**.
The existing sizes land on this scale without forcing — a reasonable
first validation.

**Contrast**: shortfall text (`materialShortColor`/`resourceShortColor`,
both existing combat-orange-family reds) sits on the same dark card/ground
tokens used elsewhere in the HUD where that pairing is already relied on
for legibility — no new color pairing is introduced by this spec, so no
new contrast risk either. Flag for implementation: verify this pairing
against the final chosen card background once the panel-system
consolidation (Open Decision 2) actually happens, since that may shift
the ground color this text sits on.

**Spacing**: existing `padPx`/`gapPx` values mostly already land on
multiples of 4 (the proposed grid). One exception found:
`materialCardGapPx` (10px) doesn't — flag for reconciliation at
implementation time, not a blocker for this spec.

**Section-eyebrow ALL-CAPS labels**: this screen is the concrete test
case for system Open Decision 5 — "FEATURES UNLOCKED" etc. are exactly
the pattern in question. This spec does **not** resolve it; it's called
out here so your review of this prototype is also, implicitly, a decision
on that pattern.

**Branding**: no Blitzmire wordmark anywhere on this screen — consistent
with the branding-restraint decision; this was already true, nothing to
remove.

## Design System Candidates

- `PanelHeader` (thumb + name/transition + "?" + close) — see Layout.
- Power-as-conditional-headline-medallion — a new standing convention,
  not just this screen's choice (system Open Decision 7).
- `MajorPanelShell` as a shared *paint*, not just shared math (ties to
  the existing "Improve" item in `DESIGN_SYSTEM.md`).
- Header thumbnail: once proven here, `BuildingLevelInfoScreen` should
  receive the same treatment for consistency (it currently has none).

## Acceptance Criteria

1. Panel renders within pixel-identical outer bounds to the Army panel at
   any screen size the Army panel supports.
2. All four zones fit with zero scrolling at the minimum supported
   landscape viewport.
3. The "?" control's hit area is ≥44px even though its glyph is small.
4. Exactly one medallion-styled element appears when Power changes at the
   next level; zero appear when it doesn't.
5. The UPGRADE button's three states (locked / disabled / normal) are
   visually distinguishable using only states already defined in
   `BuildingUpgradeContent` — no fourth state invented.
6. The header thumbnail never exceeds Zone A's height — it cannot shrink
   Features/Cost to make room for itself.
7. No Blitzmire wordmark/logo renders anywhere on this screen.

## Open Questions

- ALL-CAPS section-eyebrow convention — keep deliberately, or revisit?
  (system Open Decision 5 — your call on review.)
- `materialCardGapPx` grid reconciliation (10px vs. the proposed 4px
  grid) — minor, defer to implementation.
- Should the header thumbnail be tappable (shortcut into Info)? Not
  specified either way here — flagged as a possible future enhancement,
  not required for this prototype.
