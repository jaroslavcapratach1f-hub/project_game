# Factions and Troop Types

## ROSTER SCOPE (hard constraint — see 01)
Ground forces only. The **9 combat classes** are the entire roster, forever:
Infantry · Light Tank · Medium Tank · Heavy Tank · Super Heavy Tank ·
Tank Hunter · Anti-Tank Gun · Howitzer · Rocket Launcher. Plus the non-combat
Gather Truck. **No aircraft** (no fighters, bombers, or scout planes — recon is
the ground-based Recon Post, GDD 04). **No naval.** Nothing amphibious.

## FACTIONS = CAMPS
The 3 factions are Warpath's "camps": each sets a unit's roster **and** a
combat identity used by matchmaking, Onslaught scaling, and roster advice.
- **GERMANY — Garrison / Armor.** Best at holding and cracking bases.
  Exclusives: Super Heavy Tank, Anti-Tank Gun. No Light Tanks, Howitzers,
  Rocket Launchers.
- **USA — Assault / Range.** Best at raids, reach, and mobile fights.
  Exclusive: Light Tank. Shares Howitzers with Russia. No Super Heavy, no AT
  Gun, no Rocket Launcher.
- **RUSSIA — Siege / AoE.** Best at area denial and grinding stacks.
  Exclusive: Rocket Launcher. Shares Howitzers with USA. No Super Heavy, no
  AT Gun, no Light Tank.

───────────────────────────────────────────────────────────────
GERMANY (Defensive Powerhouse)
───────────────────────────────────────────────────────────────
Does NOT have: Light Tanks, Howitzers, Rocket Launchers.

INFANTRY (3 Tiers by Weapon):
1. Kar98k Squad (4★) — Basic bolt-action rifle squad.
2. Gewehr 43 Squad (4.5★) — Semi-automatic upgrade, faster fire rate.
3. StG 44 Squad (5★) — Assault rifle squad, highest DPS for German infantry.

TANKS & VEHICLES:
- Medium Tank: Panzer IV (Balanced, versatile frontline unit)
- Heavy Tank: Tiger I (High armor, slow, high damage)
- Super Heavy Tank [UNIQUE]: Maus (Massive HP/Armor, base defense specialist, bait unit)
  Current art: basic **five-star starting** German-grey Maus, museum-referenced
  tall enclosed hull and massive rear-set turret; separate hull/turret GLBs.
  Larger than heavy (160 versus 115 world-pixel hull fit), no advanced upgrades.
  Germany only. Shared runtime mesh supplies combat, portrait and one yard unit.
  Current image and rotating video live in assets/units/super_heavy/tier01/.
- Tank Hunter: Jagdpanther (No turret, high penetration, ambush specialist)

ARMORED CAR (Non-combat — Gather Truck):
- SdKfz 251 Hanomag (German skin). Unarmed. Collects Money/Steel/Oil
  from world-map nodes outside the base. See 07-economy.md.

ARTILLERY:
- Anti-Tank Gun [UNIQUE]: PaK 40 (Base defense specialist, massive damage vs tanks, useless on field, must deploy)

───────────────────────────────────────────────────────────────
USA (Range and Speed)
───────────────────────────────────────────────────────────────
Does NOT have: Super Heavy Tanks, Anti-Tank Guns, Rocket Launchers.

INFANTRY (3 Tiers by Weapon):
1. Springfield Squad (4★) — Basic bolt-action rifle squad.
2. M1 Garand Squad (4.5★) — Standard semi-auto, highly reliable.
3. M2 Carbine Squad (5★) — Fully automatic carbine, high burst damage.

The USA infantry tier-01 model uses one source-space torso and two leg pieces
per soldier. The world-map view mounts each troop as its own body, preserves
formation spacing, faces each body along its own travel bearing, and drives
alternating hip pivots from distance travelled. This keeps the squad readable
as separate troops while retaining the composite squad combat rules.

TANKS & VEHICLES:
- Light Tank [UNIQUE]: M24 Chaffee (Fastest tank, full combat unit, great for raids/reach)
  Current art: supplied tier-01 GLB split into fixed hull/stowage and independent
  turret/gun, registered as `usa:lightTank` in `Unit3DConfig`. Fielded in the
  first starting squad slot; original stats and turn rates retained.
- Medium Tank: M4 Sherman (Versatile, balanced)
- Heavy Tank: M26 Pershing (Strong armor, frontline fighter)
- Tank Hunter: M18 Hellcat (Fastest tank hunter, glass cannon, hit-and-run)

ARMORED CAR (Non-combat — Gather Truck):
- M3 Half-track (US skin). Unarmed. Collects Money/Steel/Oil from
  world-map nodes outside the base. See 07-economy.md.

ARTILLERY:
- Howitzer: M12 GMC (Highest range in the game, lowest HP/Def, must deploy, indirect fire)
  Level-1 art: user-supplied wheeled howitzer GLB, registered as `usa:howitzer`.
  The existing roster key, stats, deployment and indirect-fire behavior remain.
  The intact static model and squad portrait share the same source asset.

───────────────────────────────────────────────────────────────
RUSSIA / USSR (Area Destruction & Durability)
───────────────────────────────────────────────────────────────
Does NOT have: Super Heavy Tanks, Anti-Tank Guns, Light Tanks.

INFANTRY (3 Tiers by Weapon):
1. Mosin-Nagant Squad (4★) — Basic bolt-action rifle squad.
2. Mosin-Nagant Carbine Squad (4.5★) — Shorter barrel, slightly faster mobility/firing.
3. SVT-40 Squad (5★) — Semi-automatic rifle squad, highest Russian infantry DPS.

TANKS & VEHICLES:
- Medium Tank: T-34-85 (Versatile, highly durable medium)
- Heavy Tank: IS-2 (Strong armor, high caliber gun)
- Tank Hunter: SU-100 (No turret, excellent at cracking heavy armor)

ARMORED CAR (Non-combat — Gather Truck):
- GAZ-AA truck (Soviet skin). Unarmed. Collects Money/Steel/Oil from
  world-map nodes outside the base. See 07-economy.md.

ARTILLERY:
- Howitzer: ISU-152 (Lower range than USA Howitzer, but higher HP/Defense, indirect fire)
- Rocket Launcher [UNIQUE]: BM-13 Katyusha (AoE ground target, fast movement, short range, devastating but fragile. Hit-and-run area raider).

───────────────────────────────────────────────────────────────
TROOP SUMMARY
───────────────────────────────────────────────────────────────
| Category         | Germany | USA | Russia |
|------------------|---------|-----|--------|
| Infantry Tiers   | 3       | 3   | 3      |
| Medium Tank      | Yes     | Yes | Yes    |
| Heavy Tank       | Yes     | Yes | Yes    |
| Tank Hunter      | Yes     | Yes | Yes    |
| Armored Car*     | Yes     | Yes | Yes    |
| Light Tank       | NO      | YES | NO     |
| Super Heavy Tank | YES     | NO  | NO     |
| Howitzer         | NO      | YES | YES    |
| Anti-Tank Gun    | YES     | NO  | NO     |
| Rocket Launcher  | NO      | NO  | YES    |

*Armored Car = Gather Truck. Non-combat resource-collection vehicle
used on the world map outside the base. Faction entries are cosmetic
skins only; stats and behaviour are defined in 07-economy.md, not here.
Not acquired from the Armory and not counted among combat troops.

───────────────────────────────────────────────────────────────
UNIT STAT DEFINITIONS
───────────────────────────────────────────────────────────────
Base rows live in `src/config/UnitStats.js` at **4★, level 1, no bonuses**.
Final stats = base → `StatResolution` (star, level, research, nation, officer,
modify, equipment) → `CombatConfig` damage model.

| Stat | Meaning | Level-scales? |
|---|---|---|
| hp | durability | yes |
| dmg | damage per shot / per rocket | yes |
| def | flat mitigation, `1 − def/(def+220)` | yes |
| armor | `[front, side, rear]` depth (armoured classes) | yes |
| pen | armour penetration (average; ±12% jitter) | yes |
| rof | shots per second (`salvo`+`reloadSeconds` for launchers) | no |
| rng | range in tiles (`minRng` dead zone for indirect fire) | no |
| spd | move speed, tiles/sec | no |
| acc | base accuracy 0–1 | no |
| dodge | evasion 0–1, subtracted from attacker acc | no |
| aoe | splash radius in tiles | no |

**Class traits** (`CLASS_TRAITS`): `armored` (subject to the pen/armour
table), `deployable` (howitzers + AT gun must set up), `furyChargePerSec`.
**Flags** per unit: `noTurret`, `noOverpen`, `indirect`, `explosive`,
`vsInfantry` (multiplier), `nonCombat`.

Every combat unit has **3 equipment slots** (see 13-equipment). The Gather
Truck has none.

## Implemented troop contact visuals (2026-09-26)
USA level-1 Pershing now has independent hull and turret meshes; turret
rotation leaves deck stowage and running gear fixed. Existing roster,
statistics, targeting and movement rules are unchanged. Light/medium/heavy
USA tanks use model-specific track contact dimensions. Every vehicle class
leaves two bands, increasing from light through medium/tank hunter, heavy
and super-heavy. Wheeled howitzer/AT/rocket/truck visuals use narrower tire
marks; the Russian tracked howitzer retains tread bands. Individual living
soldiers leave alternating footprints without changing their walking model.
Other faction vehicles and tank hunters/super-heavy retain their existing
2D placeholder art; trail dimensions are tuned to those current bodies.
