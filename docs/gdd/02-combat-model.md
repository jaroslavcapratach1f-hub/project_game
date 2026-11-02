# Combat Control Model

Combat happens **in place on the world map**. There is no arena, no scene
swap, no separate battlefield. When a marching squad reaches a hostile target
(Marauder camp, field guard, enemy base, another player's squad) the fight
resolves where they meet, with both sides' individual units already rendered
on the map.

## UNIT AUTONOMY
- All units default to **CALM**: passive, do not fire even at enemies in range.
- Units move only on explicit player orders.
- The first shot (yours or theirs) trips **Fury** — from then on both sides
  auto-fire (see Field Fury / Base Fury).

## PLAYER ORDERS (touch)
- Tap own unit/squad → select (info panel).
- Drag from own unit → map location → **move / march**.
- Drag from own unit → enemy → **manual attack-target override** (all fire
  redirects to that enemy immediately).
- Tap selected unit → **Send to Base** (walks home, heals in Hospital).
- Long-press own squad → radial: Recall to Base · Hold Position · Entrench ·
  Converge · Follow · Retreat.
- Tap enemy target → target action menu (March · Attack · Rally · Scout ·
  Gather, per target type).
- Pinch → zoom · drag empty ground → pan · tap empty ground → deselect.
- **Quick Battle:** low-level Marauder camps can be auto-resolved without
  watching — outcome from Power × counters, same rewards, wounded/dead applied.

## ENCOUNTER FLOW
1. Squad marches to the target; ETA shown on the march line.
2. On arrival both forces take firing positions in their **formation**,
   facing each other; still CALM until the first shot.
3. Fury trips → auto-fire. Player repositions units, overrides targets,
   entrenches infantry, or retreats.
4. Ends when one side is destroyed or fully retreats. Dead cost personnel;
   a capacity-limited share of casualties are **wounded** (recoverable via
   Hospital). NPC clears drop resources/items; PvP gives Power-kill credit and
   cripples the loser — **no resource loot** (pillar 8).

## SQUAD FORMATION
- Each squad has a formation preset: **Line** (default), **Spread** (vs AoE),
  **Column** (march/among cover), **Wedge** (push).
- Tanky classes hold the front; indirect/long-range (howitzer, launcher, AT
  gun) sit at the back. Deployables (howitzer, AT gun) must **set up** before
  firing and are helpless while packing/unpacking.
- Set formation at the base or before a march; can be nudged mid-fight by
  dragging units.

## TERRAIN & STANCE
- Tiles carry a terrain type — **open / forest / urban / hills / road** —
  affecting cover (def), move speed, and line of sight.
- **Entrench** (infantry, AT gun): stationary damage mitigation, cannot move
  until un-entrenched. The classic hold-the-line stance.
- Attacking uphill / into urban costs accuracy; roads speed marches.

## TYPE COUNTERS  (`COUNTERS` in `src/config/CombatConfig.js`)
Rock-paper-scissors, Warpath chain. Soft ×1.2, hard ×1.35, artillery-vs-
infantry ×2.0:
- Launcher → Infantry (hard) · Howitzer → Infantry & bases (hard)
- Infantry → AT Gun, Tank Hunter
- AT Gun → Super Heavy Tank (hard)
- Light Tank → AT Gun, Howitzer, Tank Hunter
- Medium Tank → Light Tank, Tank Hunter
- Heavy Tank → Medium Tank, Light Tank
- Super Heavy Tank → Heavy Tank
- Tank Hunter → Heavy Tank (hard)

## FIELD FURY  (outside base)
- Trips the moment ANY field unit initiates an attack.
- ALL field units enter Fury (including units parked near base but outside it).
- Fury first-targets the unit that initiated; then auto-fires any non-allied
  in range. Player can drag-aim to override.
- Independent from Base Fury. Strategic: park a howitzer as an ambush trap.

## BASE FURY  (inside base)
- Base defense is DORMANT by default; activates ONLY when the base is attacked.
- Base guns + all garrisoned units enter Base Fury; base guns focus ALL fire
  on the first attacker until it dies or leaves, then pick another.
- Stays active 2 min after the last attacker dies/leaves.
- Units inside the base during Field Fury do NOT shoot — only Base Fury arms
  the garrison.

## DEFENDER CONTROL  (online)
- **Target reset:** pull any troop out of the base and back in — resets the
  focused target, no cooldown.
- **Manual target:** take a troop out and attack a specific enemy — ALL base
  fire redirects to it immediately.
- **Attacker counterplay:** lead with the tankiest unit (super-heavy / Maus)
  to soak base fire; commit the rest only once the guns are committed, or the
  base splits fire across targets.

## ALLIANCE IMMUNITY
- Allied and allied-alliance units never damage each other; Fury targeting
  auto-skips them. Reinforcements garrison a defender's base (see 19).

═══════════════════════════════════════════════════════════════
DAMAGE MODEL
═══════════════════════════════════════════════════════════════
Numbers in `src/config/CombatConfig.js`. Per shot fired:

1. **Hit roll** — lands if `rand() < clamp(attackerAcc − targetDodge, 0.35, 0.98)`.
2. **Raw** = attacker damage (per rocket for salvo weapons).
3. **× Type counter** — `COUNTERS[attackerClass][targetClass]` (1.0 if none).
   Soft 1.2, hard 1.35, artillery-vs-infantry 2.0.
4. **× Penetration result** — only when the target class is armoured
   (light/medium/heavy/super-heavy tank, tank hunter):
   - `pen < depth` → **Ricochet** ×0.35
   - `depth ≤ pen < 2·depth` → **Penetrate** ×1.0
   - `pen ≥ 2·depth` → **Overmatch** ×1.15
   - `depth` is the **facing hit**: front (120° arc), rear (90° arc), else side.
   - Ricochet upgrades to Penetrate if the attacker is purpose-built AT
     (`noOverpen`: tank hunters, AT gun) **or** a counter pair exists.
   - Explosive weapons (howitzers, launchers) skip this table vs armour and
     use a flat `explosiveVsArmour` multiplier — they hurt every tank class.
5. **× Defense mitigation** — `× (1 − def / (def + 220))`.
6. **× Splash** — 1.0 at centre falling to 0.5 at the AoE edge.
7. **× Variance** — ±10%.
Floor: never below 5% of the step-3 value.

## UNIT FURY METER  (separate from Field / Base Fury)
- Every unit has a Fury meter (0–100) that charges while firing and while
  taking hits; charge rate is per class (`furyChargePerSec`).
- At full: **+35% damage**, **+15% move speed** for 10 s, then a 20 s cooldown.
- Officer active skills trigger automatically as their own meters fill.
- Officer skills and this meter apply **after** stat resolution, so they always
  feel impactful regardless of gear.
