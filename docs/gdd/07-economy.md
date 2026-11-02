# Resource Economy

## CURRENCIES & SOURCES
- Money: Treasury. Used for Research.
- Steel: Steelworks. Used for Research.
- Oil: Crude Oil Reserve. Used for Research.
- Construction Materials: Engineering Center. Used ONLY
  for building upgrades. 6 types: Wood Planks, Bricks,
  Cement, Metal Beams, Asphalt, Concrete.
- Arms Coupons: Used in Armory for crate pulls. Source TBD.
- Troop Parts: From Disassemble Factory. Used in Assembly.
- Special Items: From Disassemble Factory. Used in Assembly.
- Officer Shards: From duplicate officer pulls. Used for promotion.
- Officer Vouchers: For officer crate pulls. Source TBD.

## WORLD GATHERING
- Resources exist on the world map, on gather nodes outside the base
- Gather Trucks — a.k.a. "Armored Car" in-game — are the ONLY unit
  used for gathering. Non-combat, unarmed, cannot fight or garrison.
- Assigned to a node to collect Money, Steel or Oil over time
- One faction skin per truck (Germany / USA / Russia) — cosmetic only,
  no stat difference. Modelled under src/entities/armored-cars/.
- Number of Gather Trucks unlocked via Research Center → Industry tech
- Gather speed and node tier also raised by Industry research
- NOT produced in a Barracks/Factory and NOT dropped by the Armory
- Gather Truck vulnerability on map: TBD (see 11-open-items.md)
- Officers CANNOT be assigned to Gather Trucks

## PVP ECONOMY RULE
Resources CANNOT be stolen or looted through PvP combat.
Attacking a base destroys troops and Base for strategic
advantage, not for economic raiding.

## CORE RESOURCES  (three producible)
Money / Steel / Oil — the only resources with storage buildings and the only
ones relevant to the no-loot rule (they still **cannot** be stolen). Storage
caps grow with the summed level of that resource's buildings (up to 4 each);
overflow production is discarded. Defined in `src/config/ResourceConfig.js`.

## TOP-BAR RESOURCES  (Warpath parity — 5)
The HUD resource bar shows **Military Funds (Money) · Steel · Crude Oil ·
Reserve Troops (Personnel, GDD 06) · Gold (premium, GDD 22)**. Construction
Materials are crafted stock, not on the bar. There is **no** universal
star-up token — Assembly consumes real units.

## CONSTRUCTION MATERIALS  (6 types, tiered)
Engineering Center only; spent ONLY on building upgrades. A building upgrade
to level L consumes every material whose tier is unlocked at L:
| Tier | Material | From building level |
|---|---|---|
| 1 | Wood Planks | 1 |
| 2 | Bricks | 6 |
| 3 | Cement | 12 |
| 4 | Metal Beams | 18 |
| 5 | Asphalt | 24 |
| 6 | Concrete | 30 |
Demand per upgrade scales ×1.26 per level and is split across the unlocked
tiers by weight. Defined in `src/config/MaterialsConfig.js`.

## MANUFACTURING ECONOMY  (see 14-parts-and-modify)
- **Troop Parts** — Infantry / Vehicle / Ordnance / Universal; from the
  Disassemble Factory, spent in Assembly.
- **Blueprints** — assembled from fragments (crates, market, conversion);
  a complete blueprint + parts + Money manufactures a unit.
- **Troop Component** — Disassemble Factory output; fuels Modify, equipment
  enhancement, and the conversion store.
- **Conversion Tokens** — from surplus blueprints/parts; spent on wanted
  fragments, equipment parts, or universal parts.

## WORLD GATHER-NODE TIERS
Nodes come in 6 quality tiers (`WORLD.gatherNodeTiers`); yield multiplier
`[1, 1.4, 1.9, 2.5, 3.2, 4.0]`. Higher tiers unlock via Industry research
(`dev_node_tier_access`).