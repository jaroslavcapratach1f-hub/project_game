# Parts, Blueprints, Components & Modify

Defined in `src/config/PartsConfig.js`. This is the manufacturing economy
behind the Assembly Workshop (#9), Disassemble Factory (#8) and Parts
Workshop (#7). Not equipment — that is 13-equipment.

## PART CATEGORIES
Disassembly produces one category by class:
- **Infantry Parts** — infantry
- **Vehicle Parts** — light/medium/heavy/super-heavy tanks, tank hunters
- **Ordnance Parts** — howitzers, rocket launchers, AT guns
- **Universal Parts** — any recipe, always accepted

## BLUEPRINTS
A troop is manufactured from a **complete blueprint + parts + Money + time**.
- Blueprints are assembled from **fragments** (20 / 45 / 90 for target
  4★ / 4★+ / 5★).
- Fragments drop from crates (2 per single pull, 25 per ten-pull), the Black
  Market, and the conversion store.

## COMPONENTS
**Troop Component** is the Disassemble Factory's output. Yield by star is in
`ProgressionConfig.DISASSEMBLE_YIELD` — 3★ best, higher stars diminishing.
Components fuel **Modify**, **equipment enhancement**, and **conversion**.

## MODIFY
Permanent flat-percent stat adds bought with Components (+Money):
- Applies to **hp, dmg, def, armor, pen**.
- Each purchase = **+1%**, feeding the `modify` layer in `StatResolution`.
- Total capped by `parts_workshop.modifyCapPct` (5% + 0.6%/level).
- Component cost per step grows ×1.15.
- Disassembling the troop refunds nothing and clears all Modify (GDD 04).

## CONVERSION STORE
Turn surplus into **Conversion Tokens**, then spend them:
- Surplus blueprints → tokens (1 / 4 / 9 / 20 by star).
- 100 surplus parts → 3 tokens.
- Store: blueprint fragments (2 tk), a random equipment part of the shop's
  tier (12 tk), 50 universal parts (5 tk).
