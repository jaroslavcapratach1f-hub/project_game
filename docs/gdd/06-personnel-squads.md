# Personnel & Squad System

Numbers in `src/config/PersonnelConfig.js`.

## PERSONNEL POOL
- Global pool shared across all 5 Military Barracks.
- Regenerates automatically over time.
- Recovery rate and capacity set by **Reserves Barracks** level (1–35), raised
  further by the Support / Doctrine "reserve recovery" research.
- Consumed when a troop/squad is created.
- Returned when voluntarily dismantled outside combat.
- Deducted when a troop is destroyed (**not** returned, but the pool regens);
  the barracks slot frees immediately.
- System kills troops after 30 days offline (personnel deducted, regens later).

## RESERVES BARRACKS TABLES  (L1 … L35)
- **Capacity** L1=300 → L33=5500 → **L34=5700, L35=5900**.
- **Recovery** (percent of capacity per day) L1=0 → L33=900 →
  **L34=925, L35=950**.
- Regen tick = 60 s: `regenPerTick = capacity · (recoveryPct/100) / 86400 · 60`.

## SQUAD SYSTEM — EVERY UNIT IS DRAWN
- A "troop" deploys as a **squad of individually simulated units**. Each unit
  has its **own sprite, position, facing, HP bar and target**. There is no
  abstract stack and **no on-screen number standing in for hidden units** —
  commit more personnel and you literally see more vehicles/soldiers roll out.
- **Squad size = `floor(personnelAssigned / entityCost)`**, clamped to the
  per-class cap.
  - Medium Tank costs 4: 4 → 1 tank, 8 → 2 tanks, 12 → 3 tanks, …
- **Per-class cap** starts at `SQUAD_BASE_CAP` (infantry 10, medium tank 6,
  heavy 5, howitzer 4, super-heavy 3, …) and rises toward `SQUAD_HARD_CEILING`
  (infantry 20, tanks 12, …) via **Barracks level** (`rallySquadSize`) and the
  **Military `mil_rally_size`** research. The hard ceiling is a performance
  bound, not a design one.
- Because every vehicle is a real entity: large squads = clustered targets =
  AoE value. Rocket launchers target a ground area; fast troops can drive out
  of the beaten zone before the salvo lands (skilled dodging).

## ENTITY COST (personnel per rendered unit)
infantry 2 · light tank 3 · medium tank 4 · AT gun 4 · tank hunter 5 ·
howitzer 5 · rocket launcher 6 · heavy tank 7 · super-heavy 12 ·
gather truck 0.

## TROOP LIFECYCLE
Available in Barracks → Deployed on Map → Combat → Damaged → Recalled to Base →
Hospital → Repaired → Ready.  OR  → Destroyed → Personnel Deducted → Slot Freed.
