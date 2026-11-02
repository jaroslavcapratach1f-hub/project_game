# Buildings — Architecture & Functions

There are **19 buildings**. No others. Every non-HQ building is hard-capped at
the current **Headquarters** level. Numbers are defined in
`src/config/BuildingConfig.js` (`BUILDINGS`, `buildingEffect`, `upgradeCost`);
this file is the design intent behind them.

## GLOBAL RULES
- **Level cap:** Headquarters 1–35. Every other building `min(ownMax, hqLevel)`.
- **Upgrade cost:** Money / Steel / Oil (geometric, `COST_GROWTH 1.28`) **plus
  construction materials** (see 07-economy). Higher levels also pull higher
  material tiers. **Upgrading is instant** once paid — no timer. The wait in
  this economy is upstream, in *crafting* the materials (Engineering Center,
  real time — `MaterialsConfig.materialCraftSeconds`) and in **Research**
  (Money/Steel/Oil + time per rank, see 12-research) — never in the building
  upgrade itself.
- **Power:** every level of every building adds to the player's Power score
  (see 15-power-rating). Category weights: core > military > defense > rest.
- **Count-type effects** (slots, recon vehicles, towers…) are floored.

## DYNAMIC BARRACKS SYSTEM
Military Barracks transform by what they produce, instantly and reversibly:
- Infantry → **Military Barracks**
- Tanks / Tank Hunters → **Tank Factory**
- Artillery / Rockets → **Artillery Factory**
- Armored Cars / Gather Trucks are **not** produced here (see 07-economy).
- Max **5** Military Barracks total, any mix of types.
- Visual: sprite swap, smokestack for factories, training yard for barracks.

═══════════════════════════════════════════════════════════════
RESOURCE & INDUSTRY
═══════════════════════════════════════════════════════════════

### 1. Treasury  (max 35, up to 4)
Approved levels 1–6 art: 2×2 timber pay office, secure door and genuinely open
printing/cashier bay under a canvas awning. Shared Blender-authored appearance.
Passive **Money**/hr (`moneyPerHour`, pow curve) and **money storage**
multiplier. Cannot be raided or destroyed — no resource loss in PvP.

### 2. Steelworks  (max 35, up to 4)
Levels 1–6 share a 2×2 timber workshop with masonry furnace/chimney, tilted
pouring ladle, glowing casting molds, coal shelter and anvil/hammer station.
The lower-right open frontage visibly communicates smelting; effects are decorative.
No separate flooring: workshop and equipment stand on the shared base terrain.
Passive **Steel**/hr and steel storage multiplier. Raid-proof.

### 3. Crude Oil Reserve  (max 35, up to 4)
Levels 1–6 share a 2×2 metal pumpjack plant with connected oil tanks and a small
timber service shed. Preserve the recognizable curved-head pump design. No
separate terrain slab: the base grass remains visible beneath the equipment.
Passive **Oil**/hr and oil storage multiplier. Raid-proof.

### 4. Engineering Center  (max 35, up to 2)
Factory visual, levels 1–6: compact timber production block with two sawtooth
roof bays and attached timber boiler room; only the chimney uses brick walls.
Low material stacks replace the front shed. A small left-side truss jib crane
includes a manual winch, sheave, cable and hook; all are static decoration.
Logs, finished timber, fired brick stock and a handcart communicate its purpose.
Keep the body smaller/lower than HQ within the same 3×4 plot; no separate flooring.
The visual does not change material unlocks or workshop queue counts.
Produces the **6 construction materials** (Wood Planks → Concrete). Level:
- shortens craft time (`materialCraftSpeed`)
- gates which material **tier** can be crafted (must meet each tier's
  `fromLevel`; research `dev_material_tier_access` eases this)
- base **2** parallel queues, up to **4** via `dev_second_build_queue` +
  Engineering research.

═══════════════════════════════════════════════════════════════
TROOP PIPELINE
═══════════════════════════════════════════════════════════════

### 5. Military Barracks / Tank Factory / Artillery Factory  (max 35, 5 total)
Dynamic type (above). Effects: `productionSpeed`, `productionQueueCapacity`,
`rallySquadSize` (raises the per-class squad cap — see 06-personnel-squads).
One troop type queued per slot. Personnel consumed on completion.

### 6. Armory  (max 25)
Approved levels 1–6 art: timber military warehouse, oval olive roof, open doors,
static tank assembly with hoisted turret and side ammunition/rocket crates.
The 3×3 plot and clear rollout lane are visual; acquisition remains unchanged.
Card/gacha troop acquisition with Arms Coupons. Houses the **Pity System**
(guaranteed 5★ at 100/100, bank to 300/100). Effects: `bonusPullPct`,
`pityBankExtra`. Crates: General + Germany / USA / Russia (unlock by server
day + base level). Time-gated drop pool (Days 1–9 basics only).

### 7. Parts Workshop  (max 35)
Consumes Components from #8. Does **not** disassemble.
- **Convert:** part blueprints → Conversion Tokens → conversion store.
- **Upgrade:** troop level-up with Arms EXP + Ammunition (gated every 10 lvls).
- **Promote:** star-up per Assembly rules.
- **Modify:** spend Components for permanent flat-% stats, capped by
  `modifyCapPct` (base 5% + 0.6%/level).
- **Equipment:** crafts and enhances equipment parts (`equipmentCraftSpeed`).
- **Storage:** all Parts, Blueprints, Materials.

### 8. Disassemble Factory  (max 30)
The **only** building that breaks troops down → **Troop Component**.
`processSpeed`, `componentYieldPct`, `parallelSlots`. 3★ troops exist only for
this. Higher stars yield diminishing Components (see ProgressionConfig). Also
clears a troop's Modify.

### 9. Assembly Workshop  (max 35)
Assembles 4★+ troops from Troop Parts. Tracks **Camp Prestige**
(`campPrestigeGain`) which drives the Nation Bonus. `assemblySpeed`,
`blueprintSlots`. Silver route 4→5.5, Gold route 6→8 (8.5+ future).

═══════════════════════════════════════════════════════════════
BASE INFRASTRUCTURE & DEFENSE
═══════════════════════════════════════════════════════════════

### 10. Headquarters  (max 35, one per player)
The Command Center. **HQ level = Commander (player) level** and gates every
other building (`min(ownMax, hqLevel)`). Effects: `buildingSlots`,
`baseGunDamage`, `baseGunRangeTiles` (wider than any troop range),
`baseHpPct`, `deploySquadSlots` (field squads / simultaneous marches),
`garrisonSlots`, `expansionUnlocks` (base-footprint expansion plots — see 18).
Base HP regenerates (~8 h at low level, faster with level). 4 states:
Deployed / Caravan / Redeploy / Cloud (see 09).

**Current L1 presentation (2026-09-30):** guarded timber command house in
its existing 7x8 plot, with a two-storey main building against the rear plot
edge, two attached living-space wings and shallow guarded roof terraces.
One front window per wing; upstairs terrace doors/windows remain clear.
Two front sandbag checkpoints replace the detached auxiliary buildings.
Crates, drums and command cases dress the yard. No flag, star or courtyard
map board. These are one HQ entity, without extra building functions.

### 11. Defence Wall  (max 35)
`baseHpPct` (whole-base HP) and `wallArmor` (pow). Perimeter visual.

### 12. Attack Towers  (max 35)
`towerDamage` (pow), `towerRof`, `towerCount` (+1 emplacement per ~11 lvls).
Fire **only during Base Fury**. Corner-of-wall visual.

### 13. Research Center / Academy  (max 35)
Levels 1–6 art: timber military R&D laboratory with stepped low roofs, industrial
windows, rooflights, ventilation, lattice test aerial and open tank-engine test
bay. The 3×3 plot is unchanged; research equipment is static visual dressing.
Tech tree (see 12-research). `researchSpeed`, `parallelResearch` (1→2+).
Costs Money / Steel / Oil + time per rank.

### 14. Recon Post  (max 20, one per base)
Ground recon only — **no aircraft**. Dispatches **recon vehicles** (armoured
cars / motorcycle scouts) and runs a radar mast that reveals world-map fog
along their route and around the base. Cannot scout inside enemy bases and
cannot fight. `reconVehicles`, `reconRangeTiles`, `reconDurationSeconds`,
`radarRangeTiles`. Recon vehicles return home and their revealed path re-fogs
when the player goes offline.

### 15. Hospital  (max 35, one per base)
Auto-heals garrisoned damaged troops. `repairPctPerMin`, `hospitalCapacity`
(pow), `repairSlots`. No field repair — units walk home.

### 16. Alliance Hall  (max 25, one per base)
`assistCount`, `assistCapacity` (pow), `reinforcementSlots`. Governs
reinforcement time and number of assists.

### 17. Reserves Barracks  (max 35, one per base)
**Separate** from Military Barracks; produces no troops. Sets Personnel **pool
cap** and **recovery rate** via the L1–35 tables in `PersonnelConfig.js`.

### 18. Officer Barracks  (max 25, one per base)
Levels 1–6 art is a distinctive timber officers’ recruitment hall: octagonal
roof, brass rank/laurel crest, double doors, dossier wing, covered map-table
veranda and two static sentries. Existing 3×3 footprint and acquisition/assignment
functions are preserved; no new daily-reward mechanic is implied by the art.
Officer roster + drag-assign. `officerSlots`, `officerTrainingSpeed`,
`trainingSlots`. Auto-Assign picks the best-match officer.

### 19. Black Market  (max 15)
Rotating shop. `refreshMinutes` (240 → shorter, floored), `rareStockChance`,
`marketSlots`. Sells resource packs, speed-ups, officer shards, troop parts,
blueprint fragments, equipment parts, cosmetics.

## Implemented L1 perimeter presentation (2026-09-27)
Wall and attack towers remain shared building identities with their existing
level/cost rules. Their L1 visual is a modular wooden perimeter with equal
chamfers and a pair of towers at each of four corners. The surrounding belt
uses extra grid space while enclosing the unchanged construction grid.
The shared footprint controls whole-compound navigation blocking; closed
gate and decorative props do not create new walkable breaches or obstacles.
Defence snapshots serialize visual nodes/level; whole-game persistence and
live HQ-stage growth are not provided by this visual system.


### Trench refinement approved 2026-09-27
Keep the reference's modeled bank and timber details. Use continuous open
corner passages, eight bank-cut side entrances and ten plank crossings
(half the previous twenty). Instanced revetments retain individual timber
courses, stakes, worn coping and rounded irregular soil. Smooth generic
strips are not acceptable final bank art. Earth underlay only closes seams.
Use richer brown timber and stronger olive/green accents across the kit,
without changing global lighting. The external belt may extend four cells;
construction-grid and existing compound collision rules remain unchanged.
This is visual access geometry; troop trench-cover AI is not implemented.


### Tower access and vegetation update — 2026-09-27
All tower ladder entrances face the interior. The user now explicitly requests
pines on BOTH sides of the wall, superseding inside-only dressing. Use distinct
narrow, broad and irregular crowns with varied height, width, yaw and uneven
spacing. Exterior trees occupy the wall/trench belt with clear access routes;
the distant foreground remains open. Seeded placement stays stable on rebuild.


### Vegetation density refinement — 2026-09-29
Reduce interior count and instance dimensions by 25% from the preceding layout;
round count to whole trees (HQ3: 19 -> 14). Double exterior count (5 -> 10 at HQ3),
retaining entrance/gate/tower clearances. Use textured overlapping thin needle
sprays with irregular edges and varied silhouettes, not large triangular fans.
`source/pine_foliage.py` supplies the shared foliage modeling and packed texture.

### HQ visual refinement — 2026-10-02
The existing rear-edge timber HQ and terrace wings retain their footprint and
roles. Rounded fabric bags, infantry-derived static crews, detailed mounted
guns, embedded weathered wood PBR maps and baked contact shading improve
presentation. The front checkpoints move inward; an open canvas dispatch
shelter with telephone desk and a duckboard approach occupy the forecourt.
Keep circulation open and props at field-infantry scale (1.78m reference).
No additional building role, firing AI, pathfinding obstacle or camera change.
The current asset rebuild uses Node/Three; no external modelling application.

The yard dressing extends around the whole HQ: a canvas-covered supply pallet,
grouped cases, front receiving crates, side/rear service stores and short low
sandbag runs sit on a worn compound surface. The middle approach remains clear.
The roof aerial is a straight span fixed to the final mast attachments.

HQ finishing correction: ground wear is now faint outside the footpaths, preserving
grass across the plot. Front checkpoint floorboards are trimmed within the
sandbag footprint. The supply tarp has a continuous top and hanging skirts
with clearance over all crate battens, preventing wood from protruding.

### Approved ground presentation (2026-10-03)
Grass inside the base and around its defence structures uses one continuous,
healthier green treatment. Wear is concentrated in broad, irregular gate-origin
roads, with narrower pedestrian wear; avoid two clean tank-tread lines. Roads are
permanent terrain decoration independent of building locations, including future
player relocation. Do not regenerate them from current building positions.
Preserve rounded trench banks, recessed brown floors, open entrances and cleared
gate approach. Fuller irregular pine crowns retain varied size and placement.

### Approved military barracks reference layout (2026-10-03)
A new compact timber building sits on the right of a four-bay assembly yard in
normal gameplay view; no lookout tower. Keep the 4x4 placement footprint. Each
X represents four reserve places, sixteen total, as a visual display convention.
Infantry forms one aligned squad of sixteen (four ranks of four), with four medium
or light/tank hunter/howitzer vehicles, two heavy tanks, or one SH tank. These
counts do not change current gameplay reserve/training costs. Yard displays use
the selected production class and follow the building when moved. Missing models
remain documented asset work: AT/launcher empty; SH uses the dedicated German grey Maus.


Approved 2026-10-04: the current HQ, military barracks, walls, towers, gate and
all defence components are one shared levels 1–6 design. Store once under
levels01-06, retaining necessary source inputs and current image/turntable media.
Do not duplicate files per level. Later art sets are separate work.
Barracks infantry remains sixteen, with .76-cell column and .56-cell row spacing.
Tank hunter and howitzer display four (one per bay), independently of their
training costs; heavy displays two and German SH one.
