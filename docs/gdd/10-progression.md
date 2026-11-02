# Progression, Star Tiers & Nation Bonus

## STAR LADDER
Defined in `src/config/StarTiers.js`. Rows in `UnitStats.js` are the **4★**
baseline; `STAR_MULTIPLIER` scales from there.

| Key | Label | Route | Multiplier |
|---|---|---|---|
| 3 | 3★ | — (fodder, never levelled) | 0.70 |
| 4 | 4★ | Silver | 1.00 |
| 4.5 | 4★+ | Silver | 1.18 |
| 5 | 5★ | Silver | 1.40 |
| 5.5 | 5★+ | Silver | 1.65 |
| 6 | Gold I | Gold | 1.95 |
| 6.5 | Gold I+ | Gold | 2.25 |
| 7 | Gold II | Gold | 2.60 |
| 7.5 | Gold II+ | Gold | 3.00 |
| 8 | Gold II++ | Gold | 3.45 |
| 8.5–10 | Gold III / III+ / IV / IV+ | **future** | 3.95–5.80 |

Assembly recipes (`ProgressionConfig.ASSEMBLY`): `x → x.5` consumes exact
copies; `x.5 → next` consumes same-faction units (any type). Copies needed
climb 1 → 4 across the ladder. 8.5+ have provisional multipliers and **no live
recipe** — reserved for later.

## TROOP LEVELS
- Hard cap **200**. Playable cap =
  `min(200, 5·hqLevel + militaryResearchBonus)` — HQ 35 gives 175, the
  Military `mil_level_cap` research adds up to +25 → 200.
- Level-scaled stats: hp, dmg, def, armor, pen (linear, +0.9%/level, ~×2.79 at
  L200). rof/rng/spd/acc/dodge do **not** scale.
- Arms EXP every 10-level band; Ammunition also from level 11.

## NATION BONUS (Camp Prestige)
Driven by the Assembly Workshop. Applies ONLY to same-nation troops. Set by
how many of your 5 Military Barracks are the same nation:

| Same-nation Barracks | Bonus | Name |
|---|---|---|
| 1 | 0% | None |
| 2 | +3% | Cooperation |
| 3 | +7% | Battalion |
| 4 | +12% | Division |
| 5 | +24% | Full Army Corps |

Strategic choice: all-5 same nation = +24% but no variety; mixed = tactical
options, weaker stats.

## KILL STATISTICS  (profile)
Total kills and kills by star tier (4★, 4★+, 5★, 5★+, Gold I, Gold I+,
Gold II, Gold II+, Gold II++). Higher-tier kills rank higher on the visible
"active warrior" ladder.

## POWER
Total Power (buildings + troops + research + officers + equipment) is the
public strength number — see **15-power-rating**.
